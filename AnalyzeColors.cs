using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

public class AnalyzeColors {
    public static void Main() {
        string html = File.ReadAllText("index.html", Encoding.UTF8);
        Console.WriteLine("Color occurrences in index.html:");
        Count(html, "#26354A", "Dark text (#26354A)");
        Count(html, "#EAF2FF", "Light blue surface (#EAF2FF)");
        Count(html, "#DCE5F2", "Light border (#DCE5F2)");
        Count(html, "#F8FAFF", "Light input (#F8FAFF)");
        Count(html, "#64748B", "Muted gray text (#64748B)");
        Count(html, "background: \"#FFFFFF\"", "Explicit white backgrounds");
        Count(html, "background: '#FFFFFF'", "Explicit white backgrounds (single quote)");
        Count(html, "background:\"#FFFFFF\"", "Explicit white backgrounds (no space)");
    }

    static void Count(string text, string pattern, string label) {
        int count = 0;
        int idx = 0;
        while ((idx = text.IndexOf(pattern, idx, StringComparison.OrdinalIgnoreCase)) != -1) {
            count++;
            idx += pattern.Length;
        }
        Console.WriteLine(string.Format("{0}: {1}", label, count));
    }
}
