package aurora.tools;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.io.FileUtils;

import com.yahoo.platform.yui.compressor.JarClassLoader;
import com.yahoo.platform.yui.compressor.YUICompressor;

@SuppressWarnings("unchecked")
public class PatchAll {
	
	private static final String AURORA_DIR = "src/aurora.ui.std/theme/";
	private static final String TOUCH_DIR = "src/aurora.ui.touch/theme/default/resource/";
	private static final String WEB_DIR = "src/aurora.ui.web/theme/";
	
	private static final String AURORA_JS_ALL= "base/Aurora-all.js";
	private static final String AURORA_CSS_ALL= "base/Aurora-all.css";
	
	private static final String WEB_JS_ALL= "base/core.js";
	private static final String WEB_CSS_ALL= "base/core.css";
	
	private static final List<String> THEMES = Arrays.asList("default","darkblue","black","mac","hls","bestseller");
	
	private int lineNum = 0;
	
	
	private void patchAuroraStuff() throws Exception{
		List jsList =  Arrays.asList("base/Aurora.js",
			"base/DataSet.js", 
			"base/Component.js",
			"base/Field.js",
			"base/Box.js",
			"base/ImageCode.js",
			"base/Label.js",
			"base/Link.js",
			"base/HotKey.js",
			"base/AutoCompleteView.js",
			"base/DynamicElement.js",
			"button/Button.js",
			"tooglebutton/toogleButton.js",
			"checkbox/CheckBox.js",
			"radio/Radio.js",
			"textfield/TextField.js",
			"numberfield/NumberField.js",
			"spinner/Spinner.js",
			"base/TriggerField.js",
			"combo/ComboBox.js",
			"datefield/DateField.js",
			"datefield/DatePicker.js",
			"datefield/DateTimePicker.js",
			"toolbar/ToolBar.js",
			"window/Window.js",
			"lov/Lov.js",
			"lov/MultiLov.js",
			"textarea/TextArea.js",
			"base/Customization.js",
			"queryform/QueryForm.js",
			"multitextfield/MultiTextField.js",
			"multicombobox/MultiComboBox.js",
			"percentfield/PercentField.js",
			"sidebar/SideBarPanel.js");		
		
		List cssList = Arrays.asList("base/Aurora.css",
			"iconfont/iconfont.css",
			"checkbox/CheckBox.css",
			"radio/Radio.css",
			"button/Button.css",
			"tooglebutton/toogleButton.css",
			"textfield/TextField.css",
			"numberfield/NumberField.css",
			"spinner/Spinner.css",
			"combo/ComboBox.css",
			"datefield/DateField.css",
			"toolbar/ToolBar.css",
			"window/Window.css",
			"lov/Lov.css",
			"textarea/TextArea.css",
			"multitextfield/MultiTextField.css",
			"multicombobox/MultiComboBox.css",
			"percentfield/PercentField.css",
			"sidebar/SideBarPanel.css");
		
		for(String theme:THEMES){
			patchAllFile(jsList,AURORA_DIR,theme,AURORA_JS_ALL);
			patchAllFile(cssList,AURORA_DIR,theme,AURORA_CSS_ALL);
		}		
	}	
	
	private void compressTouchStuff() throws Exception{
		List compressTouchJs = Arrays.asList("base/touch.js","base/iscroll.js");		
		List compressTouchCss = Arrays.asList("base/touch-all.css");
		compressAllFiles(compressTouchJs,TOUCH_DIR,"js");
		compressAllFiles(compressTouchCss,TOUCH_DIR,"css");
	}
	
	private void patchWebStuff() throws Exception{
		List web_js =  Arrays.asList("base/base.js","button/button.js");
		List web_css =  Arrays.asList("button/button.css");		
		patchAllFile(web_js,WEB_DIR,"default",WEB_JS_ALL);
		patchAllFile(web_css,WEB_DIR,"default",WEB_CSS_ALL);
	}
	
	
	private void compressAuroraStuff() throws Exception{
		List compressJs = Arrays.asList(AURORA_JS_ALL,
			"grid/Grid.js",
			"dashboard/Dashboard.js",
			"graphic/Graphics.js",
			"treegrid/TreeGrid.js",
			"treegrid/DynamicTreeGrid.js",
			"table/Table.js",
			"tree/Tree.js",
			"tree/DynamicTree.js",
			"tab/Tab.js",
	//		"upload/upload.js",
			"chart/Animate.js",
			"chart/Adapter.js",
			"chart/Chart.js",
			"chart/Canvas-tools.js",
			"chart/Chart-more.js",
			"chart/Exporting.js",
			"accordion/Accordion.js",
			"accordionmenu/AccordionMenu.js",
			"portal/Portal.js",
			"switchcard/SwitchCard.js",
			"menu/Menu.js",
			"menutree/MenuTree.js",
			"gridbox/GridBox.js");
		List compressCss = Arrays.asList(AURORA_CSS_ALL,
			"grid/Grid.css",
			"treegrid/TreeGrid.css",
			"table/Table.css",
			"tree/Tree.css",
			"tab/Tab.css",
			"accordion/Accordion.css",
			"accordionmenu/AccordionMenu.css",
			"portal/Portal.css",
			"menu/Menu.css",
			"menutree/MenuTree.css",
			"gridbox/GridBox.css");
		
		for(String theme:THEMES){
			String path = AURORA_DIR + theme + "/resource/";
			compressAllFiles(compressJs,path,"js");
			compressAllFiles(compressCss,path,"css");
		}		
	}
	
	public static void main(String[] args) throws Exception{
		PatchAll pa = new PatchAll();
		pa.patchAuroraStuff();
		pa.compressAuroraStuff();
		pa.compressTouchStuff();
		pa.patchWebStuff();		
	}
	
	
	public void compressAllFiles(List files, String dir, String type ) throws Exception{
		ClassLoader loader = new JarClassLoader();
        Thread.currentThread().setContextClassLoader(loader);
        Class c = loader.loadClass(YUICompressor.class.getName());
        Method main = c.getMethod("main", new Class[]{String[].class});
        File current = new File(".");
        Iterator it = files.iterator();
        while(it.hasNext()){
        	String dest = (String)it.next();
        	File file = new File(current, dir+dest);
        	if(file!=null && file.exists()){
	        	String name = file.getName();
	        	String minName = name.replaceAll("."+type, "")+"-min."+type;
	        	File minFile = new File(file.getParentFile().getAbsolutePath(),minName);
	        	String[] args = new String[]{file.getAbsolutePath(),"-o",minFile.getAbsolutePath(),"--type", type, "--charset","utf-8"};
	        	main.invoke(null, new Object[]{args});	
	        	InputStream is = new FileInputStream(minFile);
	        	byte[] buf = new byte[1024];
	        	int begin,size=0;
				while ((begin = is.read(buf)) != -1) {
					size+=begin;
				}
				is.close();
				System.out.println(minFile.getName()+" : "+size+" bytes");
        	}
        }	
	}
	
	

	
	@SuppressWarnings("unchecked")
	public void patchAllFile(List list,String baseDir,String theme, String dest) throws Exception {
		List lines = new ArrayList();
		Iterator it = list.iterator();
		File current = new File(".");
		String defaultTheme = baseDir + "default/resource/";
		String path = baseDir + theme + "/resource/";
		while(it.hasNext()){
			String name = (String)it.next();
			File file = new File(current, path+name);//file.exists();
			if((null == file || !file.exists()) && !defaultTheme.equals(path)){
				file = new File(current, defaultTheme+name);
			}
			if(file != null && file.exists()){
				List ls = FileUtils.readLines(file, "UTF-8");
				for(int i=0;i<ls.size();i++) {
		        	String line = ls.get(i).toString();
		        	lineNum ++;
		        	lines.add(line);
				}
			}			
		}
		FileUtils.writeLines(new File(current, path+dest), "UTF-8", lines);
	}
}
