using System;
using System.IO;
using System.Text;

public class BuildRunningTracker {
    public static void Main() {
        StringBuilder sb = new StringBuilder();

        sb.AppendLine(@"// ============================================================================");
        sb.AppendLine(@"// STOKE ⚡ STRAVA-INSPIRED RUNNING & MULTI-SPORT TRACKER");
        sb.AppendLine(@"// Redesigned to exact visual reference from user screen recordings (oooooo.mp4 & mmmmm.mp4)");
        sb.AppendLine(@"// ============================================================================");

        File.WriteAllText("running_tracker_base.js", sb.ToString(), Encoding.UTF8);
        Console.WriteLine("Running tracker base created.");
    }
}
