package com.pavora.mobile;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://max791687.github.io/pavora/";
    private static final String HOST = "max791687.github.io";
    private static final int FILE_CHOOSER_REQUEST = 100;
    private static final int MEDIA_PERMISSION_REQUEST = 101;
    private WebView webView;
    private ProgressBar progress;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingPermission;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(16,16,27));
        getWindow().setNavigationBarColor(Color.rgb(16,16,27));
        FrameLayout layout = new FrameLayout(this);
        layout.setBackgroundColor(Color.rgb(12,13,16));
        webView = new WebView(this);
        layout.addView(webView,new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.MATCH_PARENT));
        progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        FrameLayout.LayoutParams params=new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,5);
        layout.addView(progress,params);
        setContentView(layout);
        WebSettings settings=webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportZoom(false);
        if(Build.VERSION.SDK_INT>=26) settings.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri uri=req.getUrl();
                if("https".equals(uri.getScheme())&&HOST.equals(uri.getHost())&&uri.getPath()!=null&&uri.getPath().startsWith("/pavora")) return false;
                if("about".equals(uri.getScheme())) return false;
                try {startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(ActivityNotFoundException e){Toast.makeText(MainActivity.this,"Cannot open link",Toast.LENGTH_SHORT).show();}
                return true;
            }
            @Override public void onPageFinished(WebView v,String url){progress.setVisibility(View.GONE);}
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView v,int value){progress.setProgress(value);progress.setVisibility(value>=100?View.GONE:View.VISIBLE);}
            @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);
                fileCallback=callback;
                try{startActivityForResult(params.createIntent(),FILE_CHOOSER_REQUEST);return true;}
                catch(Exception e){fileCallback.onReceiveValue(null);fileCallback=null;Toast.makeText(MainActivity.this,"Cannot open files",Toast.LENGTH_SHORT).show();return false;}
            }
            @Override public void onPermissionRequest(PermissionRequest request){runOnUiThread(()->handlePermission(request));}
            @Override public void onPermissionRequestCanceled(PermissionRequest request){if(pendingPermission==request)pendingPermission=null;}
        });
        if(state!=null)webView.restoreState(state);else webView.loadUrl(APP_URL);
    }

    private void handlePermission(PermissionRequest request){
        if(request.getOrigin()==null||!HOST.equals(request.getOrigin().getHost())||!"https".equals(request.getOrigin().getScheme())){request.deny();return;}
        List<String> needed=new ArrayList<>();
        for(String resource:request.getResources()){
            if(PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)&&checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED)needed.add(Manifest.permission.RECORD_AUDIO);
            if(PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)&&checkSelfPermission(Manifest.permission.CAMERA)!=PackageManager.PERMISSION_GRANTED)needed.add(Manifest.permission.CAMERA);
        }
        if(needed.isEmpty()){grantMedia(request);return;}
        pendingPermission=request;
        requestPermissions(needed.toArray(new String[0]),MEDIA_PERMISSION_REQUEST);
    }
    private void grantMedia(PermissionRequest request){
        List<String> approved=new ArrayList<>();
        for(String r:request.getResources()){
            if(PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)&&checkSelfPermission(Manifest.permission.RECORD_AUDIO)==PackageManager.PERMISSION_GRANTED)approved.add(r);
            if(PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)&&checkSelfPermission(Manifest.permission.CAMERA)==PackageManager.PERMISSION_GRANTED)approved.add(r);
        }
        if(approved.isEmpty())request.deny();else request.grant(approved.toArray(new String[0]));
    }
    @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] results){
        super.onRequestPermissionsResult(requestCode,permissions,results);
        if(requestCode==MEDIA_PERMISSION_REQUEST&&pendingPermission!=null){PermissionRequest req=pendingPermission;pendingPermission=null;grantMedia(req);}
    }
    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode==FILE_CHOOSER_REQUEST&&fileCallback!=null){
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode,data));
            fileCallback=null;
        }
    }
    @Override public void onBackPressed(){
        if(webView!=null&&webView.canGoBack())webView.goBack();else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle out){webView.saveState(out);super.onSaveInstanceState(out);}
    @Override public void onDestroy(){if(fileCallback!=null){fileCallback.onReceiveValue(null);fileCallback=null;}if(webView!=null){webView.destroy();webView=null;}super.onDestroy();}
}
