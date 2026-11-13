using System;
using System.IO;
using System.Text;

public class InspectWhiteBg {
    public static void Main() {
        string html = File.ReadAllText("index.html", Encoding.UTF8);
        int idx = 0;
        int count = 0;
        while ((idx = html.IndexOf("background: \"#FFFFFF\"", idx, StringComparison.OrdinalIgnoreCase)) != -1) {
            count++;
            int start = Math.Max(0, idx - 40);
            int len = Math.Min(html.Length - start, 120);
            string snippet = html.Substring(start, len).Replace("\n", " ").Replace("\r", " ");
            Console.WriteLine(string.Format("{0}. {1}", count, snippet));
            idx += 20;
        }
    }
}
