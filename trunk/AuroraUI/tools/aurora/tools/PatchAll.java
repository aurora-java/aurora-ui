package aurora.tools;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.io.FileUtils;

import com.yahoo.platform.yui.compressor.JarClassLoader;
import com.yahoo.platform.yui.compressor.YUICompressor;


public class PatchAll {
	
	private static final String RES_DIR = "src/aurora.ui.std/theme/default/resource/";
	private static final String THEME_DIR= "src/aurora.ui.std/theme/";
	private static final String DEPLOY_DIR= "D:/WorkDevSpace/eclipse3.3/workspace/HAP/web/resource/aurora.ui.std/";//"resource/aurora.ui.std/";
	private static final String AURORA_ALL= "base/Aurora-all.js";
	private static final String CSS_ALL= "base/Aurora-all.css";
	
	private static final String THEME_DARBLUE_DIR = "src/aurora.ui.std/theme/darkblue/resource/";
	
	
	private int lineNum = 0;
	
	@SuppressWarnings("unchecked")
	public static void main(String[] args) throws Exception{
		List list = new ArrayList();
		list.add("base/Aurora.js");
		list.add("base/DataSet.js"); 
		list.add("base/Component.js");
		list.add("base/Field.js");
		list.add("base/Box.js");
		list.add("base/ImageCode.js");
		list.add("base/Label.js");
		list.add("button/Button.js");
		list.add("checkbox/CheckBox.js");
		list.add("radio/Radio.js");
		list.add("textfield/TextField.js");
		list.add("numberfield/NumberField.js");
		list.add("spinner/Spinner.js");
		list.add("base/TriggerField.js");
		list.add("combo/ComboBox.js");
		list.add("datefield/DateField.js");
		list.add("datefield/DatePicker.js");
		list.add("datefield/DateTimePicker.js");
		list.add("toolbar/ToolBar.js");
		list.add("window/Window.js");
		list.add("lov/Lov.js");
		list.add("lov/MultiLov.js");
		list.add("textarea/TextArea.js");
		
		List csslist = new ArrayList();
		csslist.add("base/Aurora.css");
		csslist.add("checkbox/CheckBox.css");
		csslist.add("radio/Radio.css");
		csslist.add("button/Button.css");
		csslist.add("textfield/TextField.css");
		csslist.add("numberfield/NumberField.css");
		csslist.add("spinner/Spinner.css");
		csslist.add("combo/ComboBox.css");
		csslist.add("datefield/DateField.css");
		csslist.add("toolbar/ToolBar.css");
		csslist.add("window/Window.css");
		csslist.add("lov/Lov.css");
		csslist.add("textarea/TextArea.css");
		
		
		List compressJs = new ArrayList();
		compressJs.add(AURORA_ALL);
		compressJs.add("grid/Grid.js");
		compressJs.add("treegrid/TreeGrid.js");
		compressJs.add("table/Table.js");
		compressJs.add("tree/Tree.js");
		compressJs.add("tab/Tab.js");
//		compressJs.add("upload/upload.js");
		compressJs.add("chart/Adapter.js");
		compressJs.add("chart/Chart.js");
		compressJs.add("chart/Exporting.js");
		List compressCss = new ArrayList();
		compressCss.add(CSS_ALL);
		compressCss.add("grid/Grid.css");
		compressCss.add("treegrid/TreeGrid.css");
		compressCss.add("table/Table.css");
		compressCss.add("tree/Tree.css");
		compressCss.add("tab/Tab.css");
//		compressCss.add("upload/upload.css");
		
		PatchAll pa = new PatchAll();
		pa.patchAllFile(list,RES_DIR,AURORA_ALL);
		pa.patchAllFile(csslist,RES_DIR,CSS_ALL);
		pa.compressAllFiles(compressJs,"js");
		pa.compressAllFiles(compressCss,"css");
//		
//		pa.deployAllFiles();
		
		
		
		pa.mergeCss();
		System.out.println(pa.lineNum);
	}
	
	@SuppressWarnings("unchecked")
	public void compressAllFiles(List files, String type) throws Exception{
		ClassLoader loader = new JarClassLoader();
        Thread.currentThread().setContextClassLoader(loader);
        Class c = loader.loadClass(YUICompressor.class.getName());
        Method main = c.getMethod("main", new Class[]{String[].class});
        File current = new File(".");
        Iterator it = files.iterator();
        while(it.hasNext()){
        	String dest = (String)it.next();
        	File file = new File(current, RES_DIR+dest);
        	String name = file.getName();
        	String minName = name.replaceAll("."+type, "")+"-min."+type;
        	File minFile = new File(file.getParentFile().getAbsolutePath(),minName);
        	String[] args = new String[]{file.getAbsolutePath(),"-o",minFile.getAbsolutePath(),"--type", type, "--charset","utf-8"};
        	main.invoke(null, new Object[]{args});	
        }	
	}
	
	

	
	@SuppressWarnings("unchecked")
	public void patchAllFile(List list,String dir, String dest) throws Exception {
		List lines = new ArrayList();
		Iterator it = list.iterator();
		File current = new File(".");
		while(it.hasNext()){
			String name = (String)it.next();
			File file = new File(current, dir+name);
			if(file != null){
				List ls = FileUtils.readLines(file, "UTF-8");
				for(int i=0;i<ls.size();i++) {
		        	String line = ls.get(i).toString();
		        	lineNum ++;
		        	lines.add(line);
				}
			}			
		}
		FileUtils.writeLines(new File(current, dir+dest), "UTF-8", lines);
	}
	
	
	public void deployAllFiles() throws IOException{
		File current = new File(".");
//		File file = new File(current, DEPLOY_DIR);
		File file = new File(DEPLOY_DIR);
		File themefile = new File(current, THEME_DIR);
		String[] files = themefile.list();
		for(int i=0;i<files.length;i++){
			String name = files[i];
			if(".svn".equals(name) || "cvs".equals(name)) continue;
			File themeDir = new File(file, name);
			if(themeDir.exists()){
				FileUtils.forceDelete(themeDir);
				FileUtils.forceMkdir(themeDir);
			}else{
				themeDir.mkdir();
			}
		}
		//copy default resource
		File resource = new File(themefile, "default/resource/");
		for(int i=0;i<files.length;i++){
			String name = files[i];
			if(".svn".equals(name) || "cvs".equals(name)) continue;
			File themeDir = new File(file, name);
			FileUtils.copyDirectory(resource, themeDir);
		}
		
		for(int i=0;i<files.length;i++){
			String name = files[i];
			if(".svn".equals(name) || "cvs".equals(name) || "default".equals(name)) continue;
			File themeDir = new File(file, name);
			File srcDir = new File(themefile, name+ "/resource/");
			FileUtils.copyDirectory(srcDir, themeDir);
		}
	}
	
	
	public void mergeCss() throws IOException{
		List csslist = new ArrayList();
		csslist.add("base/Aurora-all.css");
		csslist.add("base/Aurora-all-min.css");
		csslist.add("grid/Grid.css");
		csslist.add("grid/Grid-min.css");
		csslist.add("tab/Tab.css");
		csslist.add("tab/Tab-min.css");
		
		StringBuffer sb = new StringBuffer();
		
		List patchlines = new ArrayList();
		
		
		Iterator it1 = csslist.iterator();
		File current = new File(".");
		while(it1.hasNext()){
			String dest = (String)it1.next();
			File file = new File(current, RES_DIR+dest);
			File destFile = new File(current, THEME_DARBLUE_DIR+dest);
			FileUtils.copyFile(file, destFile);
		}
		
		Iterator it = csslist.iterator();;
		while(it.hasNext()){
			String dest = (String)it.next();
			File file = new File(current, THEME_DARBLUE_DIR+dest);
			File patch = new File(file.getParentFile(),"patch.css");
			if(patch.exists()) {
				List ls = FileUtils.readLines(patch, "UTF-8");
				for(int i=0;i<ls.size();i++) {
		        	String line = ls.get(i).toString();
		        	patchlines.add(line);
				}
			}
			
			List lines = new ArrayList();
			List fs = FileUtils.readLines(file, "UTF-8");
			for(int i=0;i<fs.size();i++) {
	        	String line = fs.get(i).toString();
	        	lines.add(line);
			}
			lines.addAll(patchlines);
			FileUtils.writeLines(new File(current, THEME_DARBLUE_DIR+dest), "UTF-8", lines);
		}
	}
}
