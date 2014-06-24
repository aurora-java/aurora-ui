package aurora.tools;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.io.FileUtils;

import com.yahoo.platform.yui.compressor.JarClassLoader;
import com.yahoo.platform.yui.compressor.YUICompressor;

@SuppressWarnings("unchecked")
public class PatchAll {
	
	private static final String TOUCH_DIR = "src/aurora.ui.touch/theme/default/resource/";
	private static final String AURORA_ALL= "base/Aurora-all.js";
	private static final String CSS_ALL= "base/Aurora-all.css";
	
	private static final String THEME_DEFAULT_DIR = "src/aurora.ui.std/theme/default/resource/";
	private static final String THEME_DARBLUE_DIR = "src/aurora.ui.std/theme/darkblue/resource/";
	private static final String THEME_BLACK_DIR = "src/aurora.ui.std/theme/black/resource/";
	private static final String THEME_MAC_DIR = "src/aurora.ui.std/theme/mac/resource/";
	private int lineNum = 0;
	
	public static void main(String[] args) throws Exception{
		List list = new ArrayList();
		list.add("base/Aurora.js");
		list.add("base/DataSet.js"); 
		list.add("base/Component.js");
		list.add("base/Field.js");
		list.add("base/Box.js");
		list.add("base/ImageCode.js");
		list.add("base/Label.js");
		list.add("base/Link.js");
		list.add("base/HotKey.js");
		list.add("base/AutoCompleteView.js");
		list.add("base/DynamicElement.js");
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
		list.add("base/Customization.js");
		list.add("queryform/QueryForm.js");
		list.add("multitextfield/MultiTextField.js");
		list.add("multicombobox/MultiComboBox.js");
		list.add("percentfield/PercentField.js");
			
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
		csslist.add("multitextfield/MultiTextField.css");
		csslist.add("multicombobox/MultiComboBox.css");
		csslist.add("percentfield/PercentField.css");
		
		
		List compressJs = new ArrayList();
		compressJs.add(AURORA_ALL);
		compressJs.add("grid/Grid.js");
		compressJs.add("dashboard/Dashboard.js");
		compressJs.add("graphic/Graphics.js");
		compressJs.add("treegrid/TreeGrid.js");
		compressJs.add("treegrid/DynamicTreeGrid.js");
		compressJs.add("table/Table.js");
		compressJs.add("tree/Tree.js");
		compressJs.add("tree/DynamicTree.js");
		compressJs.add("tab/Tab.js");
//		compressJs.add("upload/upload.js");
		compressJs.add("chart/Animate.js");
		compressJs.add("chart/Adapter.js");
		compressJs.add("chart/Chart.js");
		compressJs.add("chart/Canvas-tools.js");
		compressJs.add("chart/Chart-more.js");
		compressJs.add("chart/Exporting.js");
		compressJs.add("accordion/Accordion.js");
		compressJs.add("accordionmenu/AccordionMenu.js");
		compressJs.add("portal/Portal.js");
		compressJs.add("switchcard/SwitchCard.js");
		compressJs.add("menu/Menu.js");
		List compressCss = new ArrayList();
		compressCss.add(CSS_ALL);
		compressCss.add("grid/Grid.css");
		compressCss.add("treegrid/TreeGrid.css");
		compressCss.add("table/Table.css");
		compressCss.add("tree/Tree.css");
		compressCss.add("tab/Tab.css");
		compressCss.add("accordion/Accordion.css");
		compressCss.add("accordionmenu/AccordionMenu.css");
		compressCss.add("portal/Portal.css");
		compressCss.add("menu/Menu.css");
//		compressCss.add("upload/upload.css");
		
		List compressTouchJs = new ArrayList();
		compressTouchJs.add("base/touch.js");
		compressTouchJs.add("base/iscroll.js");
		
		List compressTouchCss = new ArrayList();
		compressTouchCss.add("base/touch-all.css");
		
		PatchAll pa = new PatchAll();
		pa.patchAllFile(list,THEME_DEFAULT_DIR,AURORA_ALL);
		pa.patchAllFile(csslist,THEME_DEFAULT_DIR,CSS_ALL);
		pa.patchAllFile(list,THEME_DARBLUE_DIR,AURORA_ALL);
		pa.patchAllFile(csslist,THEME_DARBLUE_DIR,CSS_ALL);
		pa.patchAllFile(list,THEME_BLACK_DIR,AURORA_ALL);
		pa.patchAllFile(csslist,THEME_BLACK_DIR,CSS_ALL);
		pa.patchAllFile(list,THEME_MAC_DIR,AURORA_ALL);
		pa.patchAllFile(csslist,THEME_MAC_DIR,CSS_ALL);

		pa.compressAllFiles(compressJs,THEME_DEFAULT_DIR,"js");
		pa.compressAllFiles(compressCss,THEME_DEFAULT_DIR,"css");
		pa.compressAllFiles(compressJs,THEME_DARBLUE_DIR,"js");
		pa.compressAllFiles(compressCss,THEME_DARBLUE_DIR,"css");
		pa.compressAllFiles(compressJs,THEME_BLACK_DIR,"js");
		pa.compressAllFiles(compressCss,THEME_BLACK_DIR,"css");
		pa.compressAllFiles(compressJs,THEME_MAC_DIR,"js");
		pa.compressAllFiles(compressCss,THEME_MAC_DIR,"css");
				
		pa.compressAllFiles(compressTouchJs,TOUCH_DIR,"js");
		pa.compressAllFiles(compressTouchCss,TOUCH_DIR,"css");

//		System.out.println(pa.lineNum);
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
				//if("js".equals(type))
					System.out.println(minFile.getName()+" : "+size+" bytes");
        	}else{
//        		System.out.println("File "+dir+dest+" is not exists!!");
        	}
        }	
	}
	
	

	
	@SuppressWarnings("unchecked")
	public void patchAllFile(List list,String dir, String dest) throws Exception {
		List lines = new ArrayList();
		Iterator it = list.iterator();
//		boolean isJS = AURORA_ALL.equals(dest);
		File current = new File(".");
		while(it.hasNext()){
			String name = (String)it.next();
			File file = new File(current, dir+name);//file.exists();
			if((null == file || !file.exists()) && !THEME_DEFAULT_DIR.equals(dir)){
				file = new File(current, THEME_DEFAULT_DIR+name);
			}
			if(file != null && file.exists()){
				List ls = FileUtils.readLines(file, "UTF-8");
				for(int i=0;i<ls.size();i++) {
		        	String line = ls.get(i).toString();
		        	lineNum ++;
		        	lines.add(line);
				}
//				if(isJS)lines.add(";");
			}			
		}
		FileUtils.writeLines(new File(current, dir+dest), "UTF-8", lines);
	}
}
