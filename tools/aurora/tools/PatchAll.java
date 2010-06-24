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
	private static final String AURORA_ALL= "core/Aurora-all.js";
	private static final String CSS_ALL= "core/Aurora-all.css";
	
	
	@SuppressWarnings("unchecked")
	public static void main(String[] args) throws Exception{
		List list = new ArrayList();
		list.add("core/Aurora.js");
		list.add("core/DataSet.js"); 
		list.add("core/Component.js");
		list.add("core/Field.js");
		list.add("core/Box.js");
		list.add("core/Label.js");
		list.add("button/Button.js");
		list.add("checkbox/CheckBox.js");
		list.add("radio/Radio.js");
		list.add("textfield/TextField.js");
		list.add("numberfield/NumberField.js");
		list.add("core/TriggerField.js");
		list.add("combo/ComboBox.js");
		list.add("datefield/DateField.js");
		list.add("datefield/DatePicker.js");
		list.add("toolbar/ToolBar.js");
		list.add("window/Window.js");
		list.add("lov/Lov.js");
		list.add("textarea/TextArea.js");
		
		List csslist = new ArrayList();
		csslist.add("core/Aurora.css");
		csslist.add("checkbox/CheckBox.css");
		csslist.add("radio/Radio.css");
		csslist.add("button/Button.css");
		csslist.add("textfield/TextField.css");
		csslist.add("numberfield/NumberField.css");
		csslist.add("combo/ComboBox.css");
		csslist.add("datefield/DateField.css");
		csslist.add("toolbar/ToolBar.css");
		csslist.add("window/Window.css");
		csslist.add("lov/Lov.css");
		csslist.add("textarea/TextArea.css");
		
		
		List compressJs = new ArrayList();
		compressJs.add(AURORA_ALL);
		compressJs.add("grid/Grid.js");
		compressJs.add("tree/Tree.js");
		List compressCss = new ArrayList();
		compressCss.add(CSS_ALL);
		compressCss.add("grid/Grid.css");
		
		PatchAll pa = new PatchAll();
		pa.patchAllFile(list,RES_DIR,AURORA_ALL);
		pa.patchAllFile(csslist,RES_DIR,CSS_ALL);
		pa.compressAllFiles(compressJs,"js");
		pa.compressAllFiles(compressCss,"css");
//		
//		pa.deployAllFiles();
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
        	System.out.println();
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
	
}
