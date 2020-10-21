import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.File;
import java.io.FileWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.io.UnsupportedEncodingException;
import java.util.Map;
import java.util.HashMap;
import java.nio.file.*;

public class Compile {
    private static final String USER_AGENT = "Mozilla/5.0";
    private static final String POST_URL = "https://closure-compiler.appspot.com/compile";
    private static Map<String, String> post_params = new HashMap<>();
    private static String[] directories = {"./js/common", "./js/components", "./js/pages", "./js/util"};
    private static String destination = "dist";

    public static void main(String[] args) {
        try {
            cleanDestination();
            if (createDistFolder()) {
                processJsFiles();
            }
            
        } catch(Exception e) {
            e.printStackTrace();
        }
    }

    private static String urlEncodeJs(String js) {
        try {
            return URLEncoder.encode(js, StandardCharsets.UTF_8.toString());
        } catch (UnsupportedEncodingException ex) {
            throw new RuntimeException(ex.getCause());
        }
    }

    private static void processJsFiles() throws IOException {
        int counter = 1;
        for (String dir: directories) {
            File folder = new File(dir);
            File[] listOfJsFiles = folder.listFiles();

            for(File jsFile: listOfJsFiles) {
                if (jsFile.isFile()) {
                    System.out.println(counter + ". ---------- INFO : Compiling " + jsFile.getName() + " ----------");
                    URL obj = new URL(POST_URL);
                    HttpURLConnection con = (HttpURLConnection) obj.openConnection();
                    con.setRequestMethod("POST");
                    con.setRequestProperty("User-Agent", USER_AGENT);
                    con.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
                    con.setDoOutput(true);

                    String jsString = new String(Files.readAllBytes(jsFile.toPath()));
                    post_params.put("js_code", urlEncodeJs(jsString));
                    post_params.put("compilation_level", "WHITESPACE_ONLY");
                    post_params.put("output_format", "text");
                    post_params.put("output_info", "compiled_code");
            
                    String requestData = "";
                    for (Map.Entry<String, String>entry : post_params.entrySet()) {
                        requestData = requestData + entry.getKey() + "=" + entry.getValue() + "&";
                    }
            
                    OutputStream os = con.getOutputStream();
                    os.write(requestData.getBytes());
                    os.flush();
                    os.close();
            
                    int responseCode = con.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        BufferedReader in = new BufferedReader(new InputStreamReader(
                                con.getInputStream()));
                        String inputLine;
                        StringBuffer response = new StringBuffer();
            
                        while ((inputLine = in.readLine()) != null) {
                            response.append(inputLine);
                        }
                        in.close();
            
                        String compiledSource = response.toString();
                        generateCompiledSourceFiles(jsFile.getName(), compiledSource);
                        System.out.println("Status: Success to generate minified " + jsFile.getName() + " file");
                    } else {
                        System.out.println("Status: Fail to minify " + jsFile.getName() + " file");
                    }
                    System.out.println("");
                } else {
                    System.out.println(counter + ". ---------- ERROR : A folder is encountered ----------");
                }
                counter ++;
            }
        }
    }

    private static void cleanDestination() {
        try {
            File distFolder = new File(destination);
            for (File file: distFolder.listFiles()) {
                if (!file.isDirectory()) {
                    file.delete();
                }
            }
            distFolder.delete();
        } catch (Exception e) {

        }
    }

    private static boolean createDistFolder() {
        File file = new File(destination);
        boolean bool = file.mkdir();
        if (bool) {
            System.out.println("dist directory created successfully");
            return true;
        } else {
            System.out.println("Sorry couldn’t create dist directory");
            return false;
        }
    }

    private static void generateCompiledSourceFiles(String fileName, String compiledSource) {
        try {
            FileWriter compiledFile = new FileWriter(destination + "/" + fileName);
            compiledFile.write(compiledSource);
            compiledFile.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}