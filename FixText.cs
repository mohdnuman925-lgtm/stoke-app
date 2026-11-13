using System;
using System.IO;
using System.Text;

public class FixText {
    public static void Main() {
        string file = "index.html";
        string[] lines = File.ReadAllLines(file, Encoding.UTF8);

        for (int i = 0; i < lines.Length; i++) {
            string l = lines[i];

            if (l.Trim().StartsWith("View Details")) {
                lines[i] = "            View Details \u2192";
            }
        }

        File.WriteAllLines(file, lines, Encoding.UTF8);
        Console.WriteLine("Fixed line 2734 in index.html");
    }
}
