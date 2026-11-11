# CashTrace ProGuard Rules - Strictly Offline
-keep class com.expensetracker.offline.data.local.** { *; }
-dontwarn androidx.room.paging.**
-keepattributes *Annotation*
-keepclassmembers class * extends androidx.room.RoomDatabase {
    public void <init>();
}
