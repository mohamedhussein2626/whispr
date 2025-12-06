const {
  migrateAudioFiles,
  checkMigrationNeeded,
} = require("../src/lib/audio-migration");

async function runMigration() {
  try {
    console.log("🔄 Checking if migration is needed...");
    const needsMigration = await checkMigrationNeeded();

    if (!needsMigration) {
      console.log(
        "✅ No migration needed - all files are already in the new format",
      );
      return;
    }

    console.log("🔄 Starting audio file migration...");
    const result = await migrateAudioFiles();

    console.log(
      `✅ Migration completed: ${result.success} successful, ${result.failed} failed`,
    );
  } catch (error) {
    console.error("❌ Error during migration:", error);
  }
}

runMigration();
