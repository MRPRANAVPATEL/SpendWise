/**
 * Registry of all Android project files for CashTrace native Android expense tracker.
 * Used for in-browser file explorer, search, and 1-click ZIP package download.
 */

export interface AndroidFile {
  path: string;
  category: 'gradle' | 'manifest' | 'kotlin' | 'res' | 'workflow' | 'test';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  // 1. Root build.gradle.kts
  {
    path: "build.gradle.kts",
    category: "gradle",
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.ksp) apply false
}
`
  },

  // 2. settings.gradle.kts
  {
    path: "settings.gradle.kts",
    category: "gradle",
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "CashTrace"
include(":app")
`
  },

  // 3. gradle.properties
  {
    path: "gradle.properties",
    category: "gradle",
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  },

  // 4. gradle/wrapper/gradle-wrapper.properties
  {
    path: "gradle/wrapper/gradle-wrapper.properties",
    category: "gradle",
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  },

  // 5. gradle/libs.versions.toml
  {
    path: "gradle/libs.versions.toml",
    category: "gradle",
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
ksp = "1.9.23-1.0.20"
coreKtx = "1.13.1"
junit = "4.13.2"
junitVersion = "1.1.5"
espressoCore = "3.5.1"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.9.0"
composeBom = "2024.04.01"
room = "2.6.1"
datastore = "1.1.1"
work = "2.9.0"
materialIcons = "1.6.6"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended", version.ref = "materialIcons" }

# Room
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

# DataStore
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }

# WorkManager
androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "work" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`
  },

  // 6. app/build.gradle.kts
  {
    path: "app/build.gradle.kts",
    category: "gradle",
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.expensetracker.offline"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.expensetracker.offline"
        minSdk = 29
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api"
        )
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    // Room Database (Local SQLite)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // DataStore (Preferences)
    implementation(libs.androidx.datastore.preferences)

    // WorkManager (Background Reminders)
    implementation(libs.androidx.work.runtime.ktx)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
`
  },

  // 7. app/proguard-rules.pro
  {
    path: "app/proguard-rules.pro",
    category: "gradle",
    content: `# CashTrace ProGuard Rules - Strictly Offline
-keep class com.expensetracker.offline.data.local.** { *; }
-dontwarn androidx.room.paging.**
-keepattributes *Annotation*
-keepclassmembers class * extends androidx.room.RoomDatabase {
    public void <init>();
}
`
  },

  // 8. app/src/main/AndroidManifest.xml
  {
    path: "app/src/main/AndroidManifest.xml",
    category: "manifest",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- STRICT OFFLINE PRIVACY: NO INTERNET PERMISSION DECLARED -->

    <!-- SMS detection permissions -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />

    <!-- Notifications for Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- High priority overlay popup on top of payment apps (Google Pay, PhonePe, etc.) -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

    <!-- Persistent reminders across device reboot -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:name=".ExpenseApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CashTrace"
        tools:targetApi="34">

        <!-- Main Dashboard & Setup Activity -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.CashTrace"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Instant Dialog Overlay Activity (Triggered on Debit SMS) -->
        <activity
            android:name=".ui.popup.ExpensePopupActivity"
            android:exported="false"
            android:excludeFromRecents="true"
            android:launchMode="singleTop"
            android:showOnLockScreen="true"
            android:turnScreenOn="true"
            android:theme="@style/Theme.CashTrace.Dialog"
            android:windowSoftInputMode="stateVisible|adjustResize" />

        <!-- BroadcastReceiver for Incoming Bank & UPI SMS -->
        <receiver
            android:name=".service.SmsReceiver"
            android:exported="true"
            android:permission="android.permission.BROADCAST_SMS">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

        <!-- BroadcastReceiver to recover from ongoing notification swipe-away (Android 14+) -->
        <receiver
            android:name=".service.NotificationDismissReceiver"
            android:exported="false" />

        <!-- BroadcastReceiver to restore pending reminders upon phone restart -->
        <receiver
            android:name=".service.BootCompletedReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

        <!-- FileProvider for Sharing Exported CSV to other apps -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="com.expensetracker.offline.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>
`
  },

  // 9. app/src/main/res/values/strings.xml
  {
    path: "app/src/main/res/values/strings.xml",
    category: "res",
    content: `<resources>
    <string name="app_name">CashTrace</string>
    <string name="channel_pending_name">Pending Expenses</string>
    <string name="channel_pending_desc">Persistent reminders for unlabelled SMS debits</string>
    <string name="add_details">Add details</string>
    <string name="save">Save</string>
    <string name="later">Later</string>
    <string name="spent_prefix">spent</string>
    <string name="tap_to_add_details">Tap to add payment type or label</string>
</resources>
`
  },

  // 10. app/src/main/res/values/colors.xml
  {
    path: "app/src/main/res/values/colors.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#0D9488</color>
    <color name="primary_variant">#0F766E</color>
    <color name="secondary">#14B8A6</color>
    <color name="background_light">#F8FAFC</color>
    <color name="background_dark">#0F172A</color>
    <color name="surface_light">#FFFFFF</color>
    <color name="surface_dark">#1E293B</color>
    <color name="transparent_scrim">#80000000</color>
</resources>
`
  },

  // 11. app/src/main/res/values/themes.xml
  {
    path: "app/src/main/res/values/themes.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.CashTrace" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#F8FAFC</item>
        <item name="android:windowLightStatusBar">true</item>
    </style>

    <!-- Translucent floating Dialog Activity theme for instant popup on top of other apps -->
    <style name="Theme.CashTrace.Dialog" parent="android:Theme.Material.Dialog">
        <item name="android:windowIsTranslucent">true</item>
        <item name="android:windowBackground">@android:color/transparent</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowIsFloating">true</item>
        <item name="android:backgroundDimEnabled">true</item>
        <item name="android:backgroundDimAmount">0.6</item>
        <item name="android:windowAnimationStyle">@android:style/Animation.Dialog</item>
    </style>
</resources>
`
  },

  // 12. app/src/main/res/xml/file_paths.xml
  {
    path: "app/src/main/res/xml/file_paths.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<paths>
    <cache-path name="expense_exports" path="exports/" />
</paths>
`
  },

  // 13. app/src/main/res/xml/backup_rules.xml
  {
    path: "app/src/main/res/xml/backup_rules.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="database" path="cashtrace_expenses.db" />
    <include domain="sharedpref" path="cashtrace_prefs.preferences_pb" />
</full-backup-content>
`
  },

  // 14. app/src/main/res/xml/data_extraction_rules.xml
  {
    path: "app/src/main/res/xml/data_extraction_rules.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="database" path="cashtrace_expenses.db" />
    </cloud-backup>
    <device-transfer>
        <include domain="database" path="cashtrace_expenses.db" />
    </device-transfer>
</data-extraction-rules>
`
  },

  // 15. app/src/main/res/drawable/ic_stat_expense.xml
  {
    path: "app/src/main/res/drawable/ic_stat_expense.xml",
    category: "res",
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FFFFFFFF"
      android:pathData="M19,3H5C3.89,3 3,3.9 3,5v14c0,1.1 0.89,2 2,2h14c1.1,0 2,-0.9 2,-2V5C21,3.9 20.1,3 19,3zM19,19H5V5h14V19zM13.5,13V9H10V7h5V5H9v4h3.5v2H9v2h2v2h2.5z"/>
</vector>
`
  },

  // 16. app/src/main/res/drawable/ic_launcher_foreground.xml
  {
    path: "app/src/main/res/drawable/ic_launcher_foreground.xml",
    category: "res",
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0D9488"
        android:pathData="M54,20 C35.2,20 20,35.2 20,54 C20,72.8 35.2,88 54,88 C72.8,88 88,72.8 88,54 C88,35.2 72.8,20 54,20 Z"/>
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M44,40 L64,40 M44,48 L64,48 M44,40 L44,68 M52,48 C60,48 60,60 52,60 L44,60 M52,60 L62,72"/>
</vector>
`
  },

  // 17. app/src/main/res/drawable/ic_launcher_background.xml
  {
    path: "app/src/main/res/drawable/ic_launcher_background.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0F172A"
        android:pathData="M0,0h108v108h-108z"/>
</vector>
`
  },

  // 18. app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
  {
    path: "app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  },

  // 19. app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml
  {
    path: "app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml",
    category: "res",
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  },

  // 20. ExpenseApplication.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ExpenseApplication.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.expensetracker.offline.data.local.AppDatabase
import com.expensetracker.offline.data.preferences.UserPreferencesRepository
import com.expensetracker.offline.data.repository.ExpenseRepository
import com.expensetracker.offline.service.PendingReminderWorker
import java.util.concurrent.TimeUnit

class ExpenseApplication : Application() {

    lateinit var database: AppDatabase
        private set

    lateinit var preferencesRepository: UserPreferencesRepository
        private set

    lateinit var repository: ExpenseRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        database = AppDatabase.getDatabase(this)
        preferencesRepository = UserPreferencesRepository(this)
        repository = ExpenseRepository(database.expenseDao(), preferencesRepository)

        createNotificationChannels()
        schedulePendingReminderWorker(30) // default 30 minutes
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID_PENDING_EXPENSE,
                getString(R.string.channel_pending_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_pending_desc)
                enableVibration(true)
                setShowBadge(true)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun schedulePendingReminderWorker(intervalMinutes: Long) {
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(false)
            .build()

        // Minimum WorkManager periodic interval is 15 minutes
        val effectiveMinutes = intervalMinutes.coerceAtLeast(15)

        val workRequest = PeriodicWorkRequestBuilder<PendingReminderWorker>(
            effectiveMinutes, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            WORK_NAME_PENDING_REMINDER,
            ExistingPeriodicWorkPolicy.UPDATE,
            workRequest
        )
    }

    companion object {
        const val CHANNEL_ID_PENDING_EXPENSE = "cashtrace_pending_channel"
        const val WORK_NAME_PENDING_REMINDER = "cashtrace_pending_reminder_work"

        lateinit var instance: ExpenseApplication
            private set
    }
}
`
  },

  // 21. ExpenseEntity.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/data/local/ExpenseEntity.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.data.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

enum class ExpenseStatus {
    PENDING,
    SAVED
}

@Entity(
    tableName = "expenses",
    indices = [
        Index(value = ["upiReference"], unique = false),
        Index(value = ["timestamp"]),
        Index(value = ["status"])
    ]
)
data class ExpenseEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    val amount: Double,
    val paidTo: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val sender: String = "",
    val upiReference: String? = null,
    val userName: String = "",
    val status: ExpenseStatus = ExpenseStatus.PENDING,
    val isManual: Boolean = false,
    val rawMessage: String? = null
)
`
  },

  // 22. ExpenseDao.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/data/local/ExpenseDao.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ExpenseDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity): Long

    @Update
    suspend fun updateExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)

    @Query("DELETE FROM expenses WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("SELECT * FROM expenses WHERE id = :id LIMIT 1")
    suspend fun getExpenseById(id: Long): ExpenseEntity?

    @Query("SELECT * FROM expenses WHERE upiReference = :upiRef LIMIT 1")
    suspend fun getExpenseByUpiRef(upiRef: String): ExpenseEntity?

    @Query("""
        SELECT * FROM expenses 
        WHERE amount = :amount 
          AND sender = :sender 
          AND abs(timestamp - :timestamp) < 120000 
        LIMIT 1
    """)
    suspend fun findRecentSimilar(amount: Double, sender: String, timestamp: Long): ExpenseEntity?

    @Query("SELECT * FROM expenses WHERE status = 'PENDING' ORDER BY timestamp DESC")
    fun getPendingExpensesFlow(): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE status = 'PENDING' ORDER BY timestamp DESC")
    suspend fun getPendingExpensesList(): List<ExpenseEntity>

    @Query("""
        SELECT * FROM expenses 
        WHERE status = 'SAVED' 
          AND timestamp >= :startMillis 
          AND timestamp <= :endMillis 
        ORDER BY timestamp DESC
    """)
    fun getSavedExpensesByMonthFlow(startMillis: Long, endMillis: Long): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE status = 'SAVED' ORDER BY timestamp DESC")
    fun getAllSavedExpensesFlow(): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE status = 'SAVED' ORDER BY timestamp ASC")
    suspend fun getAllSavedExpensesList(): List<ExpenseEntity>

    @Query("""
        SELECT DISTINCT paidTo FROM expenses 
        WHERE status = 'SAVED' AND paidTo != '' 
        GROUP BY paidTo 
        ORDER BY COUNT(paidTo) DESC 
        LIMIT 15
    """)
    fun getFrequentlyUsedLabels(): Flow<List<String>>

    @Query("SELECT COUNT(*) FROM expenses WHERE status = 'PENDING'")
    fun getPendingCountFlow(): Flow<Int>
}
`
  },

  // 23. Converters.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/data/local/Converters.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.data.local

import androidx.room.TypeConverter

class Converters {

    @TypeConverter
    fun fromStatus(status: ExpenseStatus?): String {
        return status?.name ?: ExpenseStatus.PENDING.name
    }

    @TypeConverter
    fun toStatus(value: String?): ExpenseStatus {
        return try {
            if (value != null) ExpenseStatus.valueOf(value) else ExpenseStatus.PENDING
        } catch (e: Exception) {
            ExpenseStatus.PENDING
        }
    }
}
`
  },

  // 24. AppDatabase.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/data/local/AppDatabase.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [ExpenseEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun expenseDao(): ExpenseDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "cashtrace_expenses.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`
  },

  // 24. UserPreferencesRepository.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/data/preferences/UserPreferencesRepository.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.data.preferences

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
`
  },

  // 25. ExpenseRepository.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/data/repository/ExpenseRepository.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.data.repository

import com.expensetracker.offline.data.local.ExpenseDao
import com.expensetracker.offline.data.local.ExpenseEntity
import com.expensetracker.offline.data.local.ExpenseStatus
import com.expensetracker.offline.data.preferences.UserPreferencesRepository
import kotlinx.coroutines.flow.Flow

class ExpenseRepository(
    private val expenseDao: ExpenseDao,
    private val preferencesRepository: UserPreferencesRepository
) {
    val userName: Flow<String> = preferencesRepository.userNameFlow
    val reminderIntervalMinutes: Flow<Int> = preferencesRepository.reminderIntervalFlow
    val customBankKeywords: Flow<String> = preferencesRepository.customBankKeywordsFlow
    val pendingExpenses: Flow<List<ExpenseEntity>> = expenseDao.getPendingExpensesFlow()
    val quickSuggestions: Flow<List<String>> = expenseDao.getFrequentlyUsedLabels()
    val pendingCount: Flow<Int> = expenseDao.getPendingCountFlow()

    fun getSavedExpensesForMonth(startMillis: Long, endMillis: Long): Flow<List<ExpenseEntity>> {
        return expenseDao.getSavedExpensesByMonthFlow(startMillis, endMillis)
    }

    fun getAllSavedExpenses(): Flow<List<ExpenseEntity>> {
        return expenseDao.getAllSavedExpensesFlow()
    }

    suspend fun getAllSavedExpensesList(): List<ExpenseEntity> {
        return expenseDao.getAllSavedExpensesList()
    }

    suspend fun getExpenseById(id: Long): ExpenseEntity? {
        return expenseDao.getExpenseById(id)
    }

    suspend fun insertPendingExpense(
        amount: Double,
        sender: String,
        upiReference: String?,
        rawMessage: String,
        timestamp: Long = System.currentTimeMillis()
    ): Long {
        // Prevent duplicate using UPI reference
        if (!upiReference.isNullOrBlank()) {
            val existing = expenseDao.getExpenseByUpiRef(upiReference)
            if (existing != null) return -1L
        }

        // Prevent duplicate using amount + timestamp (within 2 min) + sender
        val similar = expenseDao.findRecentSimilar(amount, sender, timestamp)
        if (similar != null) return -1L

        val entity = ExpenseEntity(
            amount = amount,
            paidTo = "",
            timestamp = timestamp,
            sender = sender,
            upiReference = upiReference,
            status = ExpenseStatus.PENDING,
            isManual = false,
            rawMessage = rawMessage
        )
        return expenseDao.insertExpense(entity)
    }

    suspend fun insertManualExpense(
        amount: Double,
        paidTo: String,
        timestamp: Long = System.currentTimeMillis()
    ): Long {
        val entity = ExpenseEntity(
            amount = amount,
            paidTo = paidTo.trim(),
            timestamp = timestamp,
            sender = "MANUAL",
            upiReference = null,
            status = ExpenseStatus.SAVED,
            isManual = true
        )
        return expenseDao.insertExpense(entity)
    }

    suspend fun updateExpenseDetails(id: Long, amount: Double, paidTo: String) {
        val existing = expenseDao.getExpenseById(id) ?: return
        val updated = existing.copy(
            amount = amount,
            paidTo = paidTo.trim(),
            status = ExpenseStatus.SAVED
        )
        expenseDao.updateExpense(updated)
    }

    suspend fun deleteExpense(id: Long) {
        expenseDao.deleteById(id)
    }

    suspend fun getPendingExpensesList(): List<ExpenseEntity> {
        return expenseDao.getPendingExpensesList()
    }

    suspend fun saveUserName(name: String) {
        preferencesRepository.setUserName(name)
    }

    suspend fun saveReminderInterval(minutes: Int) {
        preferencesRepository.setReminderInterval(minutes)
    }

    suspend fun saveCustomBankKeywords(keywords: String) {
        preferencesRepository.setCustomBankKeywords(keywords)
    }
}
`
  },

  // 26. SmsParser.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/service/SmsParser.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.service

import java.util.regex.Pattern

data class ParsedSmsResult(
    val isDebit: Boolean,
    val amount: Double? = null,
    val upiReference: String? = null,
    val sender: String = "",
    val account: String? = null,
    val rawMessage: String = ""
)

object SmsParser {

    private val DEBIT_KEYWORDS = listOf(
        Pattern.compile("\\bdebited\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bdebit\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bspent\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bpaid\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bsent\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\btransferred\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\btransfer to\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bpayment of\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bwithdrawn\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bpurchased\\b", Pattern.CASE_INSENSITIVE)
    )

    private val CREDIT_KEYWORDS = listOf(
        Pattern.compile("\\bcredited\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bcredit\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\breceived\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bdeposited\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\brefunded\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\breversed\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bcashback\\b", Pattern.CASE_INSENSITIVE)
    )

    private val OTP_KEYWORDS = listOf(
        Pattern.compile("\\botp\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bone time password\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bverification code\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bdo not share\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\blogin code\\b", Pattern.CASE_INSENSITIVE)
    )

    // Regex directly capturing debit-context amounts: "debited by 899.00", "paid Rs. 2,500", etc.
    // Supports Indian numbering system: 1,50,000.00 and standard 1,000,000.00
    private val DEBIT_SPECIFIC_AMOUNT_PATTERN = Pattern.compile(
        "(?:debited\\s*(?:by|for|with)?|paid|spent|sent|payment\\s*of)\\s*(?:Rs\\.?|INR|₹)?\\s*([0-9]{1,2}(?:,[0-9]{2})*,[0-9]{3}(?:\\.[0-9]{1,2})?|[0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val GENERAL_CURRENCY_AMOUNT_PATTERN = Pattern.compile(
        "(?:(?:Rs\\.?|INR|₹)\\s*)([0-9]{1,2}(?:,[0-9]{2})*,[0-9]{3}(?:\\.[0-9]{1,2})?|[0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val BALANCE_PATTERN = Pattern.compile(
        "(?:bal(?:ance)?|avl\\s*bal(?:ance)?)\\s*(?:is|:)?\\s*(?:Rs\\.?|INR|₹)?\\s*([0-9,]+(?:\\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val REF_PATTERN = Pattern.compile(
        "(?:ref(?:erence)?\\s*(?:no\\.?|num\\.?)?|upi\\s*ref(?:erence)?(?:\\s*no\\.?)?|txn\\s*(?:id|no\\.?)?|rrn[:\\s]|utr[:\\s])\\s*[:#-]?\\s*([A-Za-z0-9]{6,22})",
        Pattern.CASE_INSENSITIVE
    )

    private val ACCOUNT_PATTERN = Pattern.compile(
        "(?:a/c|acct|account)\\s*(?:no\\.?)?\\s*[*Xx]*([0-9]{3,6})",
        Pattern.CASE_INSENSITIVE
    )

    fun parse(message: String, sender: String = "BANK"): ParsedSmsResult {
        // 1. Filter out OTPs
        for (pattern in OTP_KEYWORDS) {
            if (pattern.matcher(message).find()) {
                return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
            }
        }

        // 2. Filter out Credits
        for (pattern in CREDIT_KEYWORDS) {
            if (pattern.matcher(message).find()) {
                return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
            }
        }

        // 3. Must have explicit debit indicator
        var hasDebitKeyword = false
        for (pattern in DEBIT_KEYWORDS) {
            if (pattern.matcher(message).find()) {
                hasDebitKeyword = true
                break
            }
        }
        if (!hasDebitKeyword) {
            return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
        }

        // 4. Extract Amount
        var amount: Double? = null

        // Try debit-context amount first
        val debitMatcher = DEBIT_SPECIFIC_AMOUNT_PATTERN.matcher(message)
        if (debitMatcher.find()) {
            val rawAmt = debitMatcher.group(1)?.replace(",", "")
            amount = rawAmt?.toDoubleOrNull()
        }

        // If not found, look for currency symbols and disambiguate from balance
        if (amount == null || amount <= 0.0) {
            var balAmount: Double? = null
            val balMatcher = BALANCE_PATTERN.matcher(message)
            if (balMatcher.find()) {
                balAmount = balMatcher.group(1)?.replace(",", "")?.toDoubleOrNull()
            }

            val curMatcher = GENERAL_CURRENCY_AMOUNT_PATTERN.matcher(message)
            while (curMatcher.find()) {
                val candidate = curMatcher.group(1)?.replace(",", "")?.toDoubleOrNull()
                if (candidate != null && candidate > 0.0) {
                    if (balAmount == null || Math.abs(candidate - balAmount) > 0.001) {
                        amount = candidate
                        break
                    }
                }
            }
        }

        if (amount == null || amount <= 0.0) {
            return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
        }

        // 5. Extract Reference No
        var upiRef: String? = null
        val refMatcher = REF_PATTERN.matcher(message)
        if (refMatcher.find()) {
            upiRef = refMatcher.group(1)?.trim()
        }

        // 6. Extract Account
        var account: String? = null
        val accMatcher = ACCOUNT_PATTERN.matcher(message)
        if (accMatcher.find()) {
            account = accMatcher.group(1)?.trim()
        }

        return ParsedSmsResult(
            isDebit = true,
            amount = amount,
            upiReference = upiRef,
            sender = sender,
            account = account,
            rawMessage = message
        )
    }
}
`
  },

  // 27. NotificationHelper.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/service/NotificationHelper.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.service

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.R
import com.expensetracker.offline.ui.popup.ExpensePopupActivity
import java.text.NumberFormat
import java.util.Locale

object NotificationHelper {

    private const val NOTIFICATION_ID_BASE = 1000
    private const val SUMMARY_NOTIFICATION_ID = 999
    private const val GROUP_KEY_PENDING = "com.expensetracker.offline.PENDING_GROUP"

    fun showPendingExpenseNotification(
        context: Context,
        expenseId: Long,
        amount: Double,
        sender: String,
        pendingTotalCount: Int = 1
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val formattedAmount = formatCurrency(amount)
        val title = "$formattedAmount spent – tap to add details"
        val content = if (sender.isNotBlank()) "Via $sender • Tap to save type/label" else "Tap to add payment type or label"

        // Intent to launch the instant popup
        val popupIntent = Intent(context, ExpensePopupActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(ExpensePopupActivity.EXTRA_EXPENSE_ID, expenseId)
            putExtra(ExpensePopupActivity.EXTRA_AMOUNT, amount)
            putExtra(ExpensePopupActivity.EXTRA_SENDER, sender)
        }

        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val contentPendingIntent = PendingIntent.getActivity(
            context,
            expenseId.toInt(),
            popupIntent,
            flags
        )

        // Android 14+ swipe-away guard: deleteIntent immediately re-posts if entry is still pending
        val deleteIntent = Intent(context, NotificationDismissReceiver::class.java).apply {
            putExtra(NotificationDismissReceiver.EXTRA_EXPENSE_ID, expenseId)
            putExtra(NotificationDismissReceiver.EXTRA_AMOUNT, amount)
            putExtra(NotificationDismissReceiver.EXTRA_SENDER, sender)
        }
        val deletePendingIntent = PendingIntent.getBroadcast(
            context,
            (expenseId + 50000).toInt(),
            deleteIntent,
            flags
        )

        val builder = NotificationCompat.Builder(context, ExpenseApplication.CHANNEL_ID_PENDING_EXPENSE)
            .setSmallIcon(R.drawable.ic_stat_expense)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true) // Persistent reminder
            .setAutoCancel(false)
            .setContentIntent(contentPendingIntent)
            .setDeleteIntent(deletePendingIntent)
            .setFullScreenIntent(contentPendingIntent, true) // Heads-up instant popup on payment
            .setGroup(GROUP_KEY_PENDING)
            .addAction(
                R.drawable.ic_stat_expense,
                context.getString(R.string.add_details),
                contentPendingIntent
            )

        notificationManager.notify((NOTIFICATION_ID_BASE + expenseId).toInt(), builder.build())

        // Summary notification when multiple expenses are pending
        if (pendingTotalCount > 1) {
            val summaryNotification = NotificationCompat.Builder(context, ExpenseApplication.CHANNEL_ID_PENDING_EXPENSE)
                .setSmallIcon(R.drawable.ic_stat_expense)
                .setContentTitle("$pendingTotalCount expenses need details")
                .setContentText("Tap to view and label all pending expenses")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setGroup(GROUP_KEY_PENDING)
                .setGroupSummary(true)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentIntent(contentPendingIntent)
                .build()

            notificationManager.notify(SUMMARY_NOTIFICATION_ID, summaryNotification)
        }
    }

    fun cancelNotification(context: Context, expenseId: Long) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel((NOTIFICATION_ID_BASE + expenseId).toInt())
    }

    fun cancelSummaryNotification(context: Context) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(SUMMARY_NOTIFICATION_ID)
    }

    private fun formatCurrency(amount: Double): String {
        return try {
            val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
            format.format(amount)
        } catch (e: Exception) {
            "₹%.2f".format(amount)
        }
    }
}
`
  },

  // 28. NotificationDismissReceiver.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/service/NotificationDismissReceiver.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.data.local.ExpenseStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Android 14 allows users to dismiss ongoing notifications.
 * This receiver catches dismiss actions and immediately re-posts the notification
 * if the expense entry is still PENDING in the Room database.
 */
class NotificationDismissReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val expenseId = intent.getLongExtra(EXTRA_EXPENSE_ID, -1L)
        val amount = intent.getDoubleExtra(EXTRA_AMOUNT, 0.0)
        val sender = intent.getStringExtra(EXTRA_SENDER) ?: ""

        if (expenseId <= 0L) return

        val app = context.applicationContext as ExpenseApplication
        CoroutineScope(Dispatchers.IO).launch {
            val expense = app.repository.getExpenseById(expenseId)
            if (expense != null && expense.status == ExpenseStatus.PENDING) {
                // Re-post persistent notification
                NotificationHelper.showPendingExpenseNotification(
                    context = context,
                    expenseId = expense.id,
                    amount = expense.amount,
                    sender = expense.sender
                )
            }
        }
    }

    companion object {
        const val EXTRA_EXPENSE_ID = "extra_expense_id"
        const val EXTRA_AMOUNT = "extra_amount"
        const val EXTRA_SENDER = "extra_sender"
    }
}
`
  },

  // 29. BootCompletedReceiver.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/service/BootCompletedReceiver.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.expensetracker.offline.ExpenseApplication
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Restores persistent notifications for all PENDING expenses upon device restart,
 * and ensures the WorkManager reminder is running.
 */
class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            val app = context.applicationContext as ExpenseApplication

            CoroutineScope(Dispatchers.IO).launch {
                // Reschedule WorkManager
                val interval = app.repository.reminderIntervalMinutes.first()
                app.schedulePendingReminderWorker(interval.toLong())

                // Re-post all pending expense notifications
                val pendingList = app.repository.getPendingExpensesList()
                pendingList.forEach { expense ->
                    NotificationHelper.showPendingExpenseNotification(
                        context = context,
                        expenseId = expense.id,
                        amount = expense.amount,
                        sender = expense.sender,
                        pendingTotalCount = pendingList.size
                    )
                }
            }
        }
    }
}
`
  },

  // 30. PendingReminderWorker.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/service/PendingReminderWorker.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.service

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.expensetracker.offline.ExpenseApplication

/**
 * Periodic background worker that checks for any PENDING expenses in Room,
 * ensuring notifications remain active and visible.
 */
class PendingReminderWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? ExpenseApplication ?: return Result.failure()
        val pendingList = app.repository.getPendingExpensesList()

        if (pendingList.isNotEmpty()) {
            pendingList.forEach { expense ->
                NotificationHelper.showPendingExpenseNotification(
                    context = applicationContext,
                    expenseId = expense.id,
                    amount = expense.amount,
                    sender = expense.sender,
                    pendingTotalCount = pendingList.size
                )
            }
        }

        return Result.success()
    }
}
`
  },

  // 31. SmsReceiver.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/service/SmsReceiver.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.provider.Telephony
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.ui.popup.ExpensePopupActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Manifest-registered BroadcastReceiver for SMS_RECEIVED.
 * Triggers even when the app is closed.
 */
class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        if (messages.isEmpty()) return

        val fullBodyBuilder = StringBuilder()
        var sender = ""

        for (sms in messages) {
            fullBodyBuilder.append(sms.displayMessageBody)
            if (sender.isBlank()) {
                sender = sms.displayOriginatingAddress ?: ""
            }
        }

        val fullBody = fullBodyBuilder.toString()
        val parsed = SmsParser.parse(fullBody, sender)

        if (parsed.isDebit && parsed.amount != null) {
            val app = context.applicationContext as ExpenseApplication

            CoroutineScope(Dispatchers.IO).launch {
                val expenseId = app.repository.insertPendingExpense(
                    amount = parsed.amount,
                    sender = parsed.sender,
                    upiReference = parsed.upiReference,
                    rawMessage = parsed.rawMessage
                )

                if (expenseId != -1L) {
                    val pendingCount = app.repository.getPendingExpensesList().size

                    // 1. Post High-Priority Persistent Notification (Heads-Up & Full-Screen Intent)
                    NotificationHelper.showPendingExpenseNotification(
                        context = context,
                        expenseId = expenseId,
                        amount = parsed.amount,
                        sender = parsed.sender,
                        pendingTotalCount = pendingCount
                    )

                    // 2. Launch Instant Dialog Popup over current app if overlay permission is granted
                    if (canDrawOverlays(context)) {
                        val popupIntent = Intent(context, ExpensePopupActivity::class.java).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                                    Intent.FLAG_ACTIVITY_CLEAR_TOP or 
                                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                            putExtra(ExpensePopupActivity.EXTRA_EXPENSE_ID, expenseId)
                            putExtra(ExpensePopupActivity.EXTRA_AMOUNT, parsed.amount)
                            putExtra(ExpensePopupActivity.EXTRA_SENDER, parsed.sender)
                            putExtra(ExpensePopupActivity.EXTRA_REF_NO, parsed.upiReference)
                        }
                        context.startActivity(popupIntent)
                    }
                }
            }
        }
    }

    private fun canDrawOverlays(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }
}
`
  },

  // 32. Color.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/theme/Color.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.theme

import androidx.compose.ui.graphics.Color

val Teal80 = Color(0xFF5EEAD4)
val TealGrey80 = Color(0xFF99F6E4)
val Emerald80 = Color(0xFFA7F3D0)

val Teal40 = Color(0xFF0D9488)
val TealGrey40 = Color(0xFF0F766E)
val Emerald40 = Color(0xFF059669)

val DarkBackground = Color(0xFF0B132B)
val DarkSurface = Color(0xFF1C2541)
val DarkSurfaceVariant = Color(0xFF283655)

val LightBackground = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceVariant = Color(0xFFF1F5F9)

val IndianRupeeGreen = Color(0xFF10B981)
val PendingAmber = Color(0xFFF59E0B)
val ErrorRed = Color(0xFFEF4444)
`
  },

  // 33. Theme.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/theme/Theme.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Teal80,
    secondary = TealGrey80,
    tertiary = Emerald80,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant
)

private val LightColorScheme = lightColorScheme(
    primary = Teal40,
    secondary = TealGrey40,
    tertiary = Emerald40,
    background = LightBackground,
    surface = LightSurface,
    surfaceVariant = LightSurfaceVariant
)

@Composable
fun CashTraceTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
`
  },

  // 34. Type.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/theme/Type.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 34.sp,
        lineHeight = 40.sp,
        letterSpacing = (-0.5).sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 26.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 22.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp
    )
)
`
  },

  // 35. Screen.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/navigation/Screen.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.navigation

sealed class Screen(val route: String) {
    data object Onboarding : Screen("onboarding")
    data object Dashboard : Screen("dashboard")
    data object Settings : Screen("settings")
}
`
  },

  // 36. ExpensePopupActivity.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/popup/ExpensePopupActivity.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.popup

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.service.NotificationHelper
import com.expensetracker.offline.ui.theme.CashTraceTheme
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class ExpensePopupActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val expenseId = intent.getLongExtra(EXTRA_EXPENSE_ID, -1L)
        val initialAmount = intent.getDoubleExtra(EXTRA_AMOUNT, 0.0)
        val sender = intent.getStringExtra(EXTRA_SENDER) ?: ""
        val refNo = intent.getStringExtra(EXTRA_REF_NO)

        setContent {
            CashTraceTheme {
                ExpensePopupContent(
                    initialAmount = initialAmount,
                    sender = sender,
                    refNo = refNo,
                    onSave = { updatedAmount, label ->
                        saveAndDismiss(expenseId, updatedAmount, label)
                    },
                    onLater = {
                        // Dismiss popup, notification remains ongoing
                        finish()
                    }
                )
            }
        }
    }

    private fun saveAndDismiss(expenseId: Long, amount: Double, label: String) {
        val app = application as ExpenseApplication
        val scope = (application as ExpenseApplication)
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            if (expenseId > 0L) {
                app.repository.updateExpenseDetails(expenseId, amount, label)
                NotificationHelper.cancelNotification(this@ExpensePopupActivity, expenseId)

                // Check remaining pending count to update or clear summary badge
                val remaining = app.repository.getPendingExpensesList().size
                if (remaining <= 1) {
                    NotificationHelper.cancelSummaryNotification(this@ExpensePopupActivity)
                }
            } else {
                app.repository.insertManualExpense(amount, label)
            }
            finish()
        }
    }

    companion object {
        const val EXTRA_EXPENSE_ID = "extra_expense_id"
        const val EXTRA_AMOUNT = "extra_amount"
        const val EXTRA_SENDER = "extra_sender"
        const val EXTRA_REF_NO = "extra_ref_no"
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ExpensePopupContent(
    initialAmount: Double,
    sender: String,
    refNo: String?,
    onSave: (amount: Double, label: String) -> Unit,
    onLater: () -> Unit
) {
    var amountText by remember { mutableStateOf(if (initialAmount > 0) "%.2f".format(initialAmount) else "") }
    var labelText by remember { mutableStateOf("") }
    var suggestions by remember { mutableStateOf<List<String>>(emptyList()) }

    val app = ExpenseApplication.instance
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            suggestions = app.repository.quickSuggestions.first()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp)),
            elevation = CardDefaults.cardElevation(defaultElevation = 12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Debit Detected",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        if (sender.isNotBlank()) {
                            Text(
                                text = "From $sender" + if (!refNo.isNullOrBlank()) " • Ref $refNo" else "",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    IconButton(onClick = onLater) {
                        Icon(Icons.Default.Close, contentDescription = "Later")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Amount Field
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount (₹)") },
                    prefix = { Text("₹ ", fontWeight = FontWeight.Bold) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Paid To / Type Field
                OutlinedTextField(
                    value = labelText,
                    onValueChange = { labelText = it },
                    label = { Text("Paid to / Type of payment") },
                    placeholder = { Text("e.g. Vraj - recharge, Groceries, Swiggy") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                // Quick Suggestion Chips
                if (suggestions.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Quick suggestions:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        suggestions.take(6).forEach { chip ->
                            SuggestionChip(
                                onClick = { labelText = chip },
                                label = { Text(chip) },
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onLater,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Later")
                    }

                    Button(
                        onClick = {
                            val parsedAmount = amountText.toDoubleOrNull() ?: initialAmount
                            if (parsedAmount > 0) {
                                onSave(parsedAmount, labelText)
                            }
                        },
                        modifier = Modifier.weight(1.5f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Save")
                    }
                }
            }
        }
    }
}
`
  },

  // 37. OnboardingScreen.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/onboarding/OnboardingScreen.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.onboarding

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun OnboardingScreen(
    onContinue: (name: String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var isError by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Welcome to CashTrace",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "100% Offline, Private SMS Expense Tracker",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(48.dp))

            Text(
                text = "What's your name?",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.align(Alignment.Start)
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = name,
                onValueChange = {
                    name = it
                    if (isError) isError = false
                },
                placeholder = { Text("e.g. Rahul") },
                singleLine = true,
                isError = isError,
                supportingText = if (isError) {
                    { Text("Please enter your name to continue") }
                } else null,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        onContinue(name.trim())
                    } else {
                        isError = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Text("Continue", style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}
`
  },

  // 38. DashboardViewModel.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/dashboard/DashboardViewModel.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.expensetracker.offline.data.local.ExpenseEntity
import com.expensetracker.offline.data.repository.ExpenseRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Calendar

data class DashboardUiState(
    val userName: String = "",
    val currentMonthCalendar: Calendar = Calendar.getInstance(),
    val monthlyTotal: Double = 0.0,
    val todayTotal: Double = 0.0,
    val pendingExpenses: List<ExpenseEntity> = emptyList(),
    val savedExpenses: List<ExpenseEntity> = emptyList(),
    val searchQuery: String = "",
    val filteredExpenses: List<ExpenseEntity> = emptyList(),
    val quickSuggestions: List<String> = emptyList()
)

class DashboardViewModel(
    private val repository: ExpenseRepository
) : ViewModel() {

    private val _currentCalendar = MutableStateFlow(Calendar.getInstance())
    private val _searchQuery = MutableStateFlow("")

    val uiState: StateFlow<DashboardUiState> = combine(
        repository.userName,
        _currentCalendar,
        repository.pendingExpenses,
        repository.quickSuggestions,
        _searchQuery
    ) { name, cal, pending, suggestions, query ->
        val (startMillis, endMillis) = getMonthRange(cal)
        val saved = repository.getSavedExpensesForMonth(startMillis, endMillis).first()

        val monthlySum = saved.sumOf { it.amount }

        val todayCal = Calendar.getInstance()
        val todayStart = todayCal.apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        val todayEnd = todayCal.apply {
            set(Calendar.HOUR_OF_DAY, 23)
            set(Calendar.MINUTE, 59)
            set(Calendar.SECOND, 59)
            set(Calendar.MILLISECOND, 999)
        }.timeInMillis

        val todaySum = saved.filter { it.timestamp in todayStart..todayEnd }.sumOf { it.amount }

        val filtered = if (query.isBlank()) {
            saved
        } else {
            saved.filter {
                it.paidTo.contains(query, ignoreCase = true) ||
                it.amount.toString().contains(query) ||
                it.sender.contains(query, ignoreCase = true)
            }
        }

        DashboardUiState(
            userName = name,
            currentMonthCalendar = cal,
            monthlyTotal = monthlySum,
            todayTotal = todaySum,
            pendingExpenses = pending,
            savedExpenses = saved,
            searchQuery = query,
            filteredExpenses = filtered,
            quickSuggestions = suggestions
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DashboardUiState()
    )

    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
    }

    fun previousMonth() {
        val cal = (_currentCalendar.value.clone() as Calendar).apply {
            add(Calendar.MONTH, -1)
        }
        _currentCalendar.value = cal
    }

    fun nextMonth() {
        val cal = (_currentCalendar.value.clone() as Calendar).apply {
            add(Calendar.MONTH, 1)
        }
        _currentCalendar.value = cal
    }

    fun addManualExpense(amount: Double, paidTo: String, timestamp: Long) {
        viewModelScope.launch {
            repository.insertManualExpense(amount, paidTo, timestamp)
        }
    }

    fun updateExpense(id: Long, amount: Double, paidTo: String) {
        viewModelScope.launch {
            repository.updateExpenseDetails(id, amount, paidTo)
        }
    }

    fun deleteExpense(id: Long) {
        viewModelScope.launch {
            repository.deleteExpense(id)
        }
    }

    private fun getMonthRange(calendar: Calendar): Pair<Long, Long> {
        val cal = calendar.clone() as Calendar
        cal.set(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val start = cal.timeInMillis

        cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH))
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        cal.set(Calendar.MILLISECOND, 999)
        val end = cal.timeInMillis

        return Pair(start, end)
    }
}
`
  },

  // 39. DashboardScreen.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/dashboard/DashboardScreen.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.dashboard

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expensetracker.offline.data.local.ExpenseEntity
import com.expensetracker.offline.ui.export.CsvExporter
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToSettings: () -> Unit,
    onOpenPopupForPending: (ExpenseEntity) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    var showManualAddDialog by remember { mutableStateOf(false) }
    var editingExpense by remember { mutableStateOf<ExpenseEntity?>(null) }
    var deletingExpense by remember { mutableStateOf<ExpenseEntity?>(null) }
    var showExportDialog by remember { mutableStateOf(false) }

    val monthFormat = remember { SimpleDateFormat("MMMM yyyy", Locale.getDefault()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = if (uiState.userName.isNotBlank()) "Hi, \${uiState.userName}" else "Hi there",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "CashTrace • 100% Offline",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { showExportDialog = true }) {
                        Icon(Icons.Default.Share, contentDescription = "Export CSV")
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showManualAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Expense")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Month Selector & Totals Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp)
                    ) {
                        // Month Selector Switcher
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(onClick = { viewModel.previousMonth() }) {
                                Icon(Icons.Default.ArrowBack, contentDescription = "Previous Month")
                            }
                            Text(
                                text = monthFormat.format(uiState.currentMonthCalendar.time),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            IconButton(onClick = { viewModel.nextMonth() }) {
                                Icon(Icons.Default.ArrowForward, contentDescription = "Next Month")
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Large Total Number
                        Text(
                            text = "₹ %.2f".format(uiState.monthlyTotal),
                            style = MaterialTheme.typography.displayLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "Total spent this month",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        Divider(color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.2f))
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Today's Spent:",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            Text(
                                text = "₹ %.2f".format(uiState.todayTotal),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                }
            }

            // Pending Expenses Section (Persistent alert until labelled)
            if (uiState.pendingExpenses.isNotEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.Info,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.error
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Needs Details (\${uiState.pendingExpenses.size})",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))

                            uiState.pendingExpenses.forEach { pending ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "₹ %.2f".format(pending.amount),
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Via \${pending.sender}",
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    Button(
                                        onClick = { onOpenPopupForPending(pending) },
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                                    ) {
                                        Text("Add Details")
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = uiState.searchQuery,
                    onValueChange = { viewModel.onSearchQueryChange(it) },
                    placeholder = { Text("Search by label, amount, or sender...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    trailingIcon = {
                        if (uiState.searchQuery.isNotBlank()) {
                            IconButton(onClick = { viewModel.onSearchQueryChange("") }) {
                                Icon(Icons.Default.Close, contentDescription = "Clear")
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true
                )
            }

            // Saved Expenses List Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Saved Expenses",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "\${uiState.filteredExpenses.size} items",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Expense Items List
            if (uiState.filteredExpenses.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (uiState.searchQuery.isNotBlank()) "No matching expenses found" else "No expenses saved for this month yet",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                items(uiState.filteredExpenses, key = { it.id }) { expense ->
                    ExpenseItemRow(
                        expense = expense,
                        onEdit = { editingExpense = expense },
                        onDelete = { deletingExpense = expense }
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(64.dp)) // padding for FAB
            }
        }
    }

    // Manual Add Dialog
    if (showManualAddDialog) {
        ManualExpenseDialog(
            suggestions = uiState.quickSuggestions,
            onDismiss = { showManualAddDialog = false },
            onConfirm = { amount, label, timestamp ->
                viewModel.addManualExpense(amount, label, timestamp)
                showManualAddDialog = false
            }
        )
    }

    // Edit Expense Dialog
    editingExpense?.let { expense ->
        ManualExpenseDialog(
            initialAmount = expense.amount,
            initialLabel = expense.paidTo,
            initialTimestamp = expense.timestamp,
            suggestions = uiState.quickSuggestions,
            isEditing = true,
            onDismiss = { editingExpense = null },
            onConfirm = { amount, label, _ ->
                viewModel.updateExpense(expense.id, amount, label)
                editingExpense = null
            }
        )
    }

    // Delete Confirmation Dialog
    deletingExpense?.let { expense ->
        AlertDialog(
            onDismissRequest = { deletingExpense = null },
            title = { Text("Delete Expense") },
            text = { Text("Are you sure you want to delete '₹ \${expense.amount} - \${expense.paidTo}'? This cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteExpense(expense.id)
                        deletingExpense = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { deletingExpense = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // CSV Export Dialog
    if (showExportDialog) {
        AlertDialog(
            onDismissRequest = { showExportDialog = false },
            title = { Text("Export CSV") },
            text = { Text("Choose the time range for your CSV export. The file will be exported in UTF-8 with BOM for full Excel and Sheets compatibility.") },
            confirmButton = {
                Button(
                    onClick = {
                        showExportDialog = false
                        CsvExporter.exportAndShare(
                            context = context,
                            expenses = uiState.savedExpenses,
                            rangeTitle = monthFormat.format(uiState.currentMonthCalendar.time)
                        )
                    }
                ) {
                    Text("This Month")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = {
                        showExportDialog = false
                        // Fetch all time
                        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                            val allList = com.expensetracker.offline.ExpenseApplication.instance.repository.getAllSavedExpensesList()
                            kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Main) {
                                CsvExporter.exportAndShare(
                                    context = context,
                                    expenses = allList,
                                    rangeTitle = "All Time"
                                )
                            }
                        }
                    }
                ) {
                    Text("All Time")
                }
            }
        )
    }
}

@Composable
fun ExpenseItemRow(
    expense: ExpenseEntity,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault()) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = if (expense.paidTo.isNotBlank()) expense.paidTo else "Uncategorized",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = dateFormat.format(expense.timestamp),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = if (expense.isManual) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.tertiaryContainer
                    ) {
                        Text(
                            text = if (expense.isManual) "Manual" else "SMS",
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "₹ %.2f".format(expense.amount),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", modifier = Modifier.size(20.dp))
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", modifier = Modifier.size(20.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ManualExpenseDialog(
    initialAmount: Double = 0.0,
    initialLabel: String = "",
    initialTimestamp: Long = System.currentTimeMillis(),
    suggestions: List<String> = emptyList(),
    isEditing: Boolean = false,
    onDismiss: () -> Unit,
    onConfirm: (amount: Double, label: String, timestamp: Long) -> Unit
) {
    var amountText by remember { mutableStateOf(if (initialAmount > 0) "%.2f".format(initialAmount) else "") }
    var labelText by remember { mutableStateOf(initialLabel) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (isEditing) "Edit Expense" else "Add Expense") },
        text = {
            Column {
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount (₹)") },
                    prefix = { Text("₹ ") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = labelText,
                    onValueChange = { labelText = it },
                    label = { Text("Paid to / Type of payment") },
                    placeholder = { Text("e.g. Chai, Groceries, Vraj") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                if (suggestions.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Suggestions:", style = MaterialTheme.typography.labelSmall)
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        suggestions.take(6).forEach { chip ->
                            SuggestionChip(
                                onClick = { labelText = chip },
                                label = { Text(chip) }
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amount = amountText.toDoubleOrNull() ?: 0.0
                    if (amount > 0) {
                        onConfirm(amount, labelText, initialTimestamp)
                    }
                }
            ) {
                Text(if (isEditing) "Update" else "Add")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
`
  },

  // 40. SettingsScreen.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/settings/SettingsScreen.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.settings

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.service.NotificationHelper
import com.expensetracker.offline.service.SmsReceiver
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = ExpenseApplication.instance
    val scope = rememberCoroutineScope()

    var userName by remember { mutableStateOf("") }
    var reminderInterval by remember { mutableStateOf(30) }
    var customKeywords by remember { mutableStateOf("") }

    // Live permission states
    var hasSmsPermission by remember { mutableStateOf(checkSmsPermission(context)) }
    var hasNotificationPermission by remember { mutableStateOf(checkNotificationPermission(context)) }
    var hasOverlayPermission by remember { mutableStateOf(checkOverlayPermission(context)) }
    var isBatteryUnrestricted by remember { mutableStateOf(checkBatteryUnrestricted(context)) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) {
        hasSmsPermission = checkSmsPermission(context)
        hasNotificationPermission = checkNotificationPermission(context)
    }

    LaunchedEffect(Unit) {
        userName = app.repository.userName.first()
        reminderInterval = app.repository.reminderIntervalMinutes.first()
        customKeywords = app.repository.customBankKeywords.first()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Samsung Setup") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Profile", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = userName,
                            onValueChange = {
                                userName = it
                                scope.launch { app.repository.saveUserName(it) }
                            },
                            label = { Text("Your Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }
            }

            // Permissions Checklist
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("System Permissions Checklist", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))

                        PermissionStatusRow(
                            title = "SMS Detection (RECEIVE_SMS)",
                            isGranted = hasSmsPermission,
                            actionLabel = "Grant",
                            onAction = {
                                permissionLauncher.launch(
                                    arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
                                )
                            }
                        )

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        PermissionStatusRow(
                            title = "Notifications (Android 13+)",
                            isGranted = hasNotificationPermission,
                            actionLabel = "Grant",
                            onAction = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                    permissionLauncher.launch(arrayOf(Manifest.permission.POST_NOTIFICATIONS))
                                }
                            }
                        )

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        PermissionStatusRow(
                            title = "Display over other apps (Overlay)",
                            isGranted = hasOverlayPermission,
                            actionLabel = "Enable in Settings",
                            onAction = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                    val intent = Intent(
                                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                        Uri.parse("package:\${context.packageName}")
                                    )
                                    context.startActivity(intent)
                                }
                            }
                        )

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        PermissionStatusRow(
                            title = "Battery Unrestricted (No Killing)",
                            isGranted = isBatteryUnrestricted,
                            actionLabel = "Ignore Optimization",
                            onAction = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                        data = Uri.parse("package:\${context.packageName}")
                                    }
                                    context.startActivity(intent)
                                }
                            }
                        )
                    }
                }
            }

            // Samsung One UI Specific Guidance Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Settings, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Samsung One UI Setup Guide", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "To prevent Samsung One UI from killing CashTrace in the background:\n\n" +
                                    "1. Allow restricted settings: App info > Three dots (top right) > Tap 'Allow restricted settings'.\n" +
                                    "2. Battery: App info > Battery > Select 'Unrestricted'.\n" +
                                    "3. Deep sleeping apps: Settings > Battery > Background usage limits > Ensure CashTrace is NOT in 'Sleeping apps' or 'Deep sleeping apps'. Add it to 'Never sleeping apps'.\n" +
                                    "4. Auto-launch: Ensure 'Auto start' or 'Run in background' is permitted.",
                            style = MaterialTheme.typography.bodySmall,
                            lineHeight = 18.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                                    data = Uri.parse("package:\${context.packageName}")
                                }
                                context.startActivity(intent)
                            },
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Open App Info")
                        }
                    }
                }
            }

            // Reminder Interval Setting
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Pending Reminder Frequency", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(
                            text = "WorkManager re-alerts for unlabelled expenses",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(15, 30, 60, 120).forEach { minutes ->
                                val label = if (minutes < 60) "\${minutes}m" else "\${minutes / 60}h"
                                FilterChip(
                                    selected = reminderInterval == minutes,
                                    onClick = {
                                        reminderInterval = minutes
                                        scope.launch {
                                            app.repository.saveReminderInterval(minutes)
                                            app.schedulePendingReminderWorker(minutes.toLong())
                                        }
                                    },
                                    label = { Text(label) }
                                )
                            }
                        }
                    }
                }
            }

            // Test Popup Button
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Simulate Bank Debit SMS", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(
                            text = "Inject a fake bank SMS to verify the instant popup, persistent notification, and swipe-away protection without spending real money.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = {
                                val fakeAmount = 899.00
                                val fakeSender = "SBIUPI"
                                val fakeRef = "4012" + (10000000..99999999).random()

                                scope.launch {
                                    val id = app.repository.insertPendingExpense(
                                        amount = fakeAmount,
                                        sender = fakeSender,
                                        upiReference = fakeRef,
                                        rawMessage = "A/C *1234 debited by 899.00 on 10Nov24 by transfer to Vraj. Ref No $fakeRef."
                                    )
                                    if (id > 0) {
                                        NotificationHelper.showPendingExpenseNotification(
                                            context = context,
                                            expenseId = id,
                                            amount = fakeAmount,
                                            sender = fakeSender
                                        )
                                        // Also launch popup activity
                                        val popupIntent = Intent(context, com.expensetracker.offline.ui.popup.ExpensePopupActivity::class.java).apply {
                                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_EXPENSE_ID, id)
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_AMOUNT, fakeAmount)
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_SENDER, fakeSender)
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_REF_NO, fakeRef)
                                        }
                                        context.startActivity(popupIntent)
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Send, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Test Popup with Fake ₹899 SMS")
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
fun PermissionStatusRow(
    title: String,
    isGranted: Boolean,
    actionLabel: String,
    onAction: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text(
                text = if (isGranted) "Granted" else "Missing / Denied",
                style = MaterialTheme.typography.labelSmall,
                color = if (isGranted) Color(0xFF10B981) else Color(0xFFEF4444),
                fontWeight = FontWeight.Bold
            )
        }

        if (!isGranted) {
            TextButton(onClick = onAction) {
                Text(actionLabel)
            }
        } else {
            Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFF10B981))
        }
    }
}

private fun checkSmsPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(context, Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED
}

private fun checkNotificationPermission(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
    } else {
        true
    }
}

private fun checkOverlayPermission(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Settings.canDrawOverlays(context)
    } else {
        true
    }
}

private fun checkBatteryUnrestricted(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        powerManager.isIgnoringBatteryOptimizations(context.packageName)
    } else {
        true
    }
}
`
  },

  // 41. CsvExporter.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/export/CsvExporter.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui.export

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import com.expensetracker.offline.data.local.ExpenseEntity
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStreamWriter
import java.nio.charset.StandardCharsets
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CsvExporter {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    private val monthFormat = SimpleDateFormat("yyyy-MM", Locale.getDefault())

    fun generateCsvContent(expenses: List<ExpenseEntity>): String {
        val sb = StringBuilder()
        // UTF-8 BOM so Excel and Google Sheets open ₹ and accents properly
        sb.append("\\uFEFF")

        // Headers
        sb.append("Date,Time,Amount,Paid To / Type,Reference No,Month,Source\\n")

        var totalAmount = 0.0

        for (expense in expenses) {
            val dateStr = dateFormat.format(Date(expense.timestamp))
            val timeStr = timeFormat.format(Date(expense.timestamp))
            val monthStr = monthFormat.format(Date(expense.timestamp))
            val amountStr = "%.2f".format(expense.amount)
            val paidToEscaped = escapeCsv(expense.paidTo)
            val refNoEscaped = escapeCsv(expense.upiReference ?: "")
            val source = if (expense.isManual) "Manual" else "SMS (\${expense.sender})"

            totalAmount += expense.amount

            sb.append("\$dateStr,\$timeStr,\$amountStr,\$paidToEscaped,\$refNoEscaped,\$monthStr,\$source\\n")
        }

        // Summary row
        sb.append("\\nTotal,,\${"%.2f".format(totalAmount)},,,,\\n")

        return sb.toString()
    }

    fun exportAndShare(context: Context, expenses: List<ExpenseEntity>, rangeTitle: String) {
        try {
            val csvData = generateCsvContent(expenses)

            val exportDir = File(context.cacheDir, "exports")
            if (!exportDir.exists()) exportDir.mkdirs()

            val fileName = "CashTrace_Expenses_\${rangeTitle.replace(" ", "_")}.csv"
            val file = File(exportDir, fileName)

            OutputStreamWriter(FileOutputStream(file), StandardCharsets.UTF_8).use { writer ->
                writer.write(csvData)
            }

            val uri = FileProvider.getUriForFile(
                context,
                "com.expensetracker.offline.fileprovider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/csv"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, "CashTrace Expense Export - \$rangeTitle")
                putExtra(Intent.EXTRA_TEXT, "Here is your expense report for \$rangeTitle.")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(Intent.createChooser(shareIntent, "Share or Save Expense CSV"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun escapeCsv(value: String): String {
        var str = value.replace("\"", "\"\"")
        if (str.contains(",") || str.contains("\n") || str.contains("\"")) {
            str = "\"\$str\""
        }
        return str
    }
}
`
  },

  // 42. MainActivity.kt
  {
    path: "app/src/main/java/com/expensetracker/offline/ui/MainActivity.kt",
    category: "kotlin",
    content: `package com.expensetracker.offline.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.data.local.ExpenseEntity
import com.expensetracker.offline.ui.dashboard.DashboardScreen
import com.expensetracker.offline.ui.dashboard.DashboardViewModel
import com.expensetracker.offline.ui.navigation.Screen
import com.expensetracker.offline.ui.onboarding.OnboardingScreen
import com.expensetracker.offline.ui.popup.ExpensePopupActivity
import com.expensetracker.offline.ui.settings.SettingsScreen
import com.expensetracker.offline.ui.theme.CashTraceTheme
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val app = application as ExpenseApplication
        val dashboardViewModel = DashboardViewModel(app.repository)

        setContent {
            CashTraceTheme {
                var currentScreen by remember { mutableStateOf<Screen>(Screen.Dashboard) }
                var isInitialized by remember { mutableStateOf(false) }
                val scope = rememberCoroutineScope()

                LaunchedEffect(Unit) {
                    val name = app.repository.userName.first()
                    currentScreen = if (name.isBlank()) Screen.Onboarding else Screen.Dashboard
                    isInitialized = true
                }

                if (isInitialized) {
                    when (currentScreen) {
                        is Screen.Onboarding -> {
                            OnboardingScreen(
                                onContinue = { name ->
                                    scope.launch {
                                        app.repository.saveUserName(name)
                                        currentScreen = Screen.Dashboard
                                    }
                                }
                            )
                        }
                        is Screen.Dashboard -> {
                            DashboardScreen(
                                viewModel = dashboardViewModel,
                                onNavigateToSettings = { currentScreen = Screen.Settings },
                                onOpenPopupForPending = { pending ->
                                    openPopupForExpense(pending)
                                }
                            )
                        }
                        is Screen.Settings -> {
                            SettingsScreen(
                                onNavigateBack = { currentScreen = Screen.Dashboard }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun openPopupForExpense(expense: ExpenseEntity) {
        val intent = Intent(this, ExpensePopupActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(ExpensePopupActivity.EXTRA_EXPENSE_ID, expense.id)
            putExtra(ExpensePopupActivity.EXTRA_AMOUNT, expense.amount)
            putExtra(ExpensePopupActivity.EXTRA_SENDER, expense.sender)
            putExtra(ExpensePopupActivity.EXTRA_REF_NO, expense.upiReference)
        }
        startActivity(intent)
    }
}
`
  },

  // 43. SmsParserTest.kt
  {
    path: "app/src/test/java/com/expensetracker/offline/SmsParserTest.kt",
    category: "test",
    content: `package com.expensetracker.offline

import com.expensetracker.offline.service.SmsParser
import org.junit.Assert.*
import org.junit.Test

class SmsParserTest {

    @Test
    fun testSbiUpiDebit() {
        val sms = "Dear UPI user A/C X1234 debited by 899.00 on 10Nov24 by transfer to Vraj. Ref No 401234567890. Bal: Rs. 14,200.00 - SBI"
        val result = SmsParser.parse(sms, "SBIUPI")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(899.00, result.amount!!, 0.001)
        assertEquals("401234567890", result.upiReference)
    }

    @Test
    fun testHdfcBankDebitWithInr() {
        val sms = "Alert: Your HDFC Bank A/c xx4921 has been debited for INR 1,250.50 on 10-NOV-24 towards Swiggy. UPI Ref: 331209847123. Avl bal: INR 28,400.00"
        val result = SmsParser.parse(sms, "HDFCBK")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(1250.50, result.amount!!, 0.001)
        assertEquals("331209847123", result.upiReference)
    }

    @Test
    fun testIciciBankRupeeSymbol() {
        val sms = "Dear Customer, Acct XX890 debited with ₹ 450.00 on 09-Nov-24. Info: UPI/merchant@okaxis. Ref no. 431092847192. Avl Bal INR 12,050.00."
        val result = SmsParser.parse(sms, "ICICIB")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(450.00, result.amount!!, 0.001)
        assertEquals("431092847192", result.upiReference)
    }

    @Test
    fun testAxisBankPaidPhrasing() {
        val sms = "Rs.2,500.00 paid from Axis Bank A/c no. XX9912 on 10-11-24 via UPI. Txn ID: 490182746190. Avl balance Rs 54,120."
        val result = SmsParser.parse(sms, "AXISBK")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(2500.00, result.amount!!, 0.001)
        assertEquals("490182746190", result.upiReference)
    }

    @Test
    fun testKotakMahindraSentViaUpi() {
        val sms = "Sent Rs. 350.00 from Kotak Bank AC XX331 to grocer@icici on 10-11-2024. UPI Ref 410982736192. Check bal: bit.ly/bal"
        val result = SmsParser.parse(sms, "KOTAKB")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(350.00, result.amount!!, 0.001)
        assertEquals("410982736192", result.upiReference)
    }

    @Test
    fun testPnbDebitWithUtr() {
        val sms = "PNB Alert: Rs 1500 debited from A/c *4412 on 08-11-24 through UPI. UTR: 431100982173. Avl Bal: Rs 4,500"
        val result = SmsParser.parse(sms, "PNBSMS")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(1500.00, result.amount!!, 0.001)
        assertEquals("431100982173", result.upiReference)
    }

    @Test
    fun testBankOfBarodaPaymentOfRs() {
        val sms = "BoB Alert: Payment of Rs. 899 done from A/C *7721 on 10-Nov. Ref: 489102837461. Total Avl Bal: INR 19,800."
        val result = SmsParser.parse(sms, "BOBTXN")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(899.00, result.amount!!, 0.001)
        assertEquals("489102837461", result.upiReference)
    }

    @Test
    fun testIndianNumberingLargeAmount() {
        val sms = "A/c *1234 debited by INR 1,50,000.00 on 10-Nov-24 by UPI transfer to car dealer. Ref No 401298471625."
        val result = SmsParser.parse(sms, "HDFCBK")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(150000.00, result.amount!!, 0.001)
        assertEquals("401298471625", result.upiReference)
    }

    // Negative Tests
    @Test
    fun testIgnoreSalaryCredit() {
        val sms = "Dear Customer, INR 55,000.00 credited to your A/c *8891 on 01-Nov-24 by Salary NEFT. Avl Bal INR 85,200.00"
        val result = SmsParser.parse(sms, "HDFCBK")
        assertFalse("Credit SMS should be ignored", result.isDebit)
        assertNull(result.amount)
    }

    @Test
    fun testIgnoreUpiMoneyReceived() {
        val sms = "You have received Rs. 500.00 in your A/c *3321 from Rahul via UPI. Ref: 412093847192. Balance Rs. 2,500."
        val result = SmsParser.parse(sms, "SBIUPI")
        assertFalse("Received money should be ignored", result.isDebit)
        assertNull(result.amount)
    }

    @Test
    fun testIgnoreBankOtp() {
        val sms = "739201 is your OTP for purchase of Rs. 899.00 on Card ending 1234 at Amazon. Do not share OTP with anyone."
        val result = SmsParser.parse(sms, "HDFCBK")
        assertFalse("OTP SMS should be ignored", result.isDebit)
        assertNull(result.amount)
    }

    @Test
    fun testIgnoreBalanceInquiry() {
        val sms = "Your available balance in A/c *9921 as of 10-Nov-24 is Rs. 14,230.50. Thank you for banking with us."
        val result = SmsParser.parse(sms, "AXISBK")
        assertFalse("Balance inquiry without debit should be ignored", result.isDebit)
        assertNull(result.amount)
    }
}
`
  },

  // 44. .github/workflows/build-apk.yml
  {
    path: ".github/workflows/build-apk.yml",
    category: "workflow",
    content: `name: Build Native Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch: # Allows manual 1-click trigger from GitHub Actions tab

jobs:
  build:
    name: Build Debug and Release APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.7'

      - name: Accept Android SDK Licenses
        run: |
          mkdir -p "$ANDROID_HOME/licenses" || true
          echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" > "$ANDROID_HOME/licenses/android-sdk-license" || true
          echo "84831b9409646a918e30573bab4c9c91346d8abd" > "$ANDROID_HOME/licenses/android-sdk-preview-license" || true
          yes | sdkmanager --licenses || true

      - name: Ensure Gradle Wrapper & Permissions
        run: |
          if [ ! -f "gradlew" ] || [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
            echo "Generating Gradle wrapper..."
            gradle wrapper --gradle-version 8.7
          fi
          chmod +x gradlew

      - name: Build Debug APK
        run: |
          ./gradlew assembleDebug --no-daemon --stacktrace || {
            echo "::error::assembleDebug failed. Dumping detailed compiler logs:"
            ./gradlew assembleDebug --no-daemon --info
            exit 1
          }

      - name: Build Release APK
        run: |
          ./gradlew assembleRelease --no-daemon --stacktrace || echo "Release build skipped or failed"

      - name: Upload Debug APK
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: app-debug-apk
          path: app/build/outputs/apk/debug/*.apk
          if-no-files-found: warn
          retention-days: 14

      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: app-release-apk
          path: app/build/outputs/apk/release/*.apk
          if-no-files-found: ignore
          retention-days: 14
`
  },

  // 45. .gitignore
  {
    path: ".gitignore",
    category: "gradle",
    content: `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`
  }
];
