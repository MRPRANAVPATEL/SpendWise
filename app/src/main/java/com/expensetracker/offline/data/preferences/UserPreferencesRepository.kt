package com.expensetracker.offline.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "cashtrace_prefs")

class UserPreferencesRepository(private val context: Context) {

    private object PreferencesKeys {
        val USER_NAME = stringPreferencesKey("user_name")
        val REMINDER_INTERVAL_MINUTES = intPreferencesKey("reminder_interval_minutes")
        val CUSTOM_BANK_KEYWORDS = stringPreferencesKey("custom_bank_keywords")
    }

    val userNameFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.USER_NAME] ?: ""
    }

    val reminderIntervalFlow: Flow<Int> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.REMINDER_INTERVAL_MINUTES] ?: 30
    }

    val customBankKeywordsFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.CUSTOM_BANK_KEYWORDS] ?: "SBI,HDFC,ICICI,AXIS,KOTAK,PNB,BOB,PAYTM,GPAY,PHONEPE"
    }

    suspend fun setUserName(name: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.USER_NAME] = name.trim()
        }
    }

    suspend fun setReminderInterval(minutes: Int) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.REMINDER_INTERVAL_MINUTES] = minutes
        }
    }

    suspend fun setCustomBankKeywords(keywords: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.CUSTOM_BANK_KEYWORDS] = keywords
        }
    }
}
