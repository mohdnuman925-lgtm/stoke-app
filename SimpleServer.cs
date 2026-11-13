using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Collections.Generic;

public class SimpleHttpServer {
    private TcpListener _listener;
    private string _root;
    private bool _running;
    private static readonly Dictionary<string, string> MimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
        { ".html", "text/html; charset=utf-8" },
        { ".htm", "text/html; charset=utf-8" },
        { ".js", "application/javascript; charset=utf-8" },
        { ".css", "text/css; charset=utf-8" },
        { ".json", "application/json; charset=utf-8" },
        { ".png", "image/png" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".gif", "image/gif" },
        { ".svg", "image/svg+xml" },
        { ".mp4", "video/mp4" },
        { ".ico", "image/x-icon" },
        { ".woff2", "font/woff2" },
        { ".webmanifest", "application/manifest+json; charset=utf-8" }
    };

    private static readonly string SecurityHeaders =
        "X-Content-Type-Options: nosniff\r\n" +
        "X-Frame-Options: DENY\r\n" +
        "X-XSS-Protection: 1; mode=block\r\n" +
        "Referrer-Policy: strict-origin-when-cross-origin\r\n" +
        "Permissions-Policy: camera=(self), geolocation=(self), microphone=()\r\n" +
        "Strict-Transport-Security: max-age=31536000; includeSubDomains\r\n" +
        "Content-Security-Policy: default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss:; font-src 'self' https: data:; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;\r\n";

    public static void Main(string[] args) {
        string root = args.Length > 0 ? args[0] : Directory.GetCurrentDirectory();
        int port = args.Length > 1 ? int.Parse(args[1]) : 8085;
        SimpleHttpServer server = new SimpleHttpServer(root, port);
        server.Start();
    }

    public SimpleHttpServer(string root, int port) {
        _root = Path.GetFullPath(root);
        _listener = new TcpListener(IPAddress.Any, port);
    }

    public void StartAsync() {
        Thread t = new Thread(new ThreadStart(Start));
        t.IsBackground = true;
        t.Start();
    }

    public void Start() {
        _running = true;
        _listener.Start();
        Console.WriteLine("C# HTTP Server listening on port " + ((IPEndPoint)_listener.LocalEndpoint).Port);
        while (_running) {
            try {
                TcpClient client = _listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(ProcessClient, client);
            } catch {
                if (!_running) break;
            }
        }
    }

    public void Stop() {
        _running = false;
        try { _listener.Stop(); } catch {}
    }

    private void ProcessClient(object state) {
        TcpClient client = (TcpClient)state;
        try {
            client.ReceiveTimeout = 10000;
            client.SendTimeout = 10000;
            using (NetworkStream stream = client.GetStream()) {
                byte[] buffer = new byte[8192];
                int read = stream.Read(buffer, 0, buffer.Length);
                if (read <= 0) return;

                string req = Encoding.ASCII.GetString(buffer, 0, read);
                string[] lines = req.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);
                if (lines.Length == 0) return;

                string[] parts = lines[0].Split(' ');
                if (parts.Length < 2) return;
                string method = parts[0];
                string urlPath = parts[1].Split('?')[0].TrimStart('/');
                if (string.IsNullOrEmpty(urlPath)) urlPath = "index.html";

                string fullPath = Path.GetFullPath(Path.Combine(_root, urlPath.Replace('/', Path.DirectorySeparatorChar)));
                if (!fullPath.StartsWith(_root, StringComparison.OrdinalIgnoreCase)) {
                    byte[] fBytes = Encoding.UTF8.GetBytes("403 Forbidden");
                    byte[] h = Encoding.ASCII.GetBytes("HTTP/1.1 403 Forbidden\r\nContent-Length: " + fBytes.Length + "\r\nConnection: close\r\n\r\n");
                    stream.Write(h, 0, h.Length);
                    stream.Write(fBytes, 0, fBytes.Length);
                    return;
                }

                if (method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase)) {
                    byte[] optHeaders = Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS, HEAD\r\nAccess-Control-Allow-Headers: *\r\n" + SecurityHeaders + "Content-Length: 0\r\nConnection: close\r\n\r\n");
                    stream.Write(optHeaders, 0, optHeaders.Length);
                    return;
                }

                if (!File.Exists(fullPath)) {
                    string fallback = Path.Combine(_root, "index.html");
                    if (File.Exists(fallback)) {
                        fullPath = fallback;
                    }
                }

                if (File.Exists(fullPath)) {
                    string ext = Path.GetExtension(fullPath);
                    string mime = "application/octet-stream";
                    if (MimeTypes.ContainsKey(ext)) mime = MimeTypes[ext];

                    byte[] content = File.ReadAllBytes(fullPath);

                    long start = 0;
                    long end = content.Length - 1;
                    bool isRange = false;
                    foreach (string l in lines) {
                        if (l.StartsWith("Range: bytes=", StringComparison.OrdinalIgnoreCase)) {
                            string rangeVal = l.Substring(13).Trim();
                            string[] rangeParts = rangeVal.Split('-');
                            long s, e;
                            if (rangeParts.Length > 0 && !string.IsNullOrEmpty(rangeParts[0])) {
                                if (long.TryParse(rangeParts[0], out s)) {
                                    start = s;
                                    isRange = true;
                                }
                            }
                            if (rangeParts.Length > 1 && !string.IsNullOrEmpty(rangeParts[1])) {
                                if (long.TryParse(rangeParts[1], out e)) {
                                    end = e;
                                    isRange = true;
                                }
                            }
                            break;
                        }
                    }

                    if (isRange && start <= end && end < content.Length) {
                        long length = end - start + 1;
                        string header = "HTTP/1.1 206 Partial Content\r\n" +
                                        "Content-Type: " + mime + "\r\n" +
                                        "Content-Range: bytes " + start + "-" + end + "/" + content.Length + "\r\n" +
                                        "Content-Length: " + length + "\r\n" +
                                        "Access-Control-Allow-Origin: *\r\n" +
                                        "Accept-Ranges: bytes\r\n" +
                                        "Cache-Control: no-cache\r\n" +
                                        SecurityHeaders +
                                        "Connection: close\r\n\r\n";
                        byte[] h = Encoding.ASCII.GetBytes(header);
                        stream.Write(h, 0, h.Length);
                        if (method != "HEAD") {
                            stream.Write(content, (int)start, (int)length);
                        }
                    } else {
                        string header = "HTTP/1.1 200 OK\r\n" +
                                        "Content-Type: " + mime + "\r\n" +
                                        "Content-Length: " + content.Length + "\r\n" +
                                        "Access-Control-Allow-Origin: *\r\n" +
                                        "Accept-Ranges: bytes\r\n" +
                                        "Cache-Control: no-cache\r\n" +
                                        SecurityHeaders +
                                        "Connection: close\r\n\r\n";
                        byte[] h = Encoding.ASCII.GetBytes(header);
                        stream.Write(h, 0, h.Length);
                        if (method != "HEAD") {
                            stream.Write(content, 0, content.Length);
                        }
                    }
                } else {
                    byte[] err = Encoding.UTF8.GetBytes("404 Not Found");
                    string header = "HTTP/1.1 404 Not Found\r\n" +
                                    "Content-Type: text/plain\r\n" +
                                    "Content-Length: " + err.Length + "\r\n" +
                                    "Connection: close\r\n\r\n";
                    byte[] h = Encoding.ASCII.GetBytes(header);
                    stream.Write(h, 0, h.Length);
                    if (method != "HEAD") {
                        stream.Write(err, 0, err.Length);
                    }
                }
            }
        } catch {
            // Ignore connection drops
        } finally {
            try { client.Close(); } catch {}
        }
    }
}
