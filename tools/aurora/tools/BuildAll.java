package aurora.tools;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;


@SuppressWarnings("unchecked")
public class BuildAll {
	private static final String SRC_DIR = "src/";
	private static final String STD_DIR = "aurora.ui.std/";
	private static final String TOUCH_DIR = "aurora.ui.touch/";
	private static final String RESOURCE_DIR = "resource/";
	private static final String BUILD_DIR = "build/";
	private static final String STD_THEME_DIR = "src/aurora.ui.std/theme/";
	private static final String TOUCH_THEME_DIR = "src/aurora.ui.touch/theme/";

	private static final String ZIP = "aurora.ui";
	private static final String ZIP_RESOURCE = "resource";
	
	private List std_exceptFiles = new ArrayList();
	private List touch_exceptFiles = new ArrayList();
	private List exceptLocalFiles = new ArrayList();

	public BuildAll() {
		std_exceptFiles.add("base/ext-core.js");
		std_exceptFiles.add("base/Aurora.js");
		std_exceptFiles.add("base/DataSet.js");
		std_exceptFiles.add("base/Component.js");
		std_exceptFiles.add("base/Field.js");
		std_exceptFiles.add("base/Box.js");
		std_exceptFiles.add("base/ImageCode.js");
		std_exceptFiles.add("base/Label.js");
		std_exceptFiles.add("base/Layout.js");
		std_exceptFiles.add("base/Customization.js");
		std_exceptFiles.add("base/Link.js");
		std_exceptFiles.add("base/HotKey.js");
		std_exceptFiles.add("button/Button.js");
		std_exceptFiles.add("button/SwitchButton.js");
		std_exceptFiles.add("checkbox/CheckBox.js");
		std_exceptFiles.add("checkbutton/CheckButton.js");
		std_exceptFiles.add("radio/Radio.js");
		std_exceptFiles.add("textfield/TextField.js");
		std_exceptFiles.add("numberfield/NumberField.js");
		std_exceptFiles.add("base/TriggerField.js");
		std_exceptFiles.add("combo/ComboBox.js");
		std_exceptFiles.add("datefield/DateField.js");
		std_exceptFiles.add("datefield/DatePicker.js");
		std_exceptFiles.add("datefield/DateTimePicker.js");
		std_exceptFiles.add("toolbar/ToolBar.js");
		std_exceptFiles.add("window/Window.js");
		std_exceptFiles.add("lov/Lov.js");
		std_exceptFiles.add("grid/Grid.js");
		std_exceptFiles.add("tab/Tab.js");
		std_exceptFiles.add("lov/MultiLov.js");
		std_exceptFiles.add("textarea/TextArea.js");
		std_exceptFiles.add("chart/Adapter.js");
		std_exceptFiles.add("chart/Chart.js");
		std_exceptFiles.add("chart/Exporting.js");
		std_exceptFiles.add("spinner/Spinner.js");

		std_exceptFiles.add("base/Aurora.css");
		std_exceptFiles.add("base/Aurora-all.css");
		std_exceptFiles.add("checkbox/CheckBox.css");
		std_exceptFiles.add("checkbutton/CheckButton.css");
		std_exceptFiles.add("radio/Radio.css");
		std_exceptFiles.add("button/Button.css");
		std_exceptFiles.add("button/SwitchButton.css");
		std_exceptFiles.add("textfield/TextField.css");
		std_exceptFiles.add("numberfield/NumberField.css");
		std_exceptFiles.add("combo/ComboBox.css");
		std_exceptFiles.add("datefield/DateField.css");
		std_exceptFiles.add("toolbar/ToolBar.css");
		std_exceptFiles.add("window/Window.css");
		std_exceptFiles.add("lov/Lov.css");
		std_exceptFiles.add("textarea/TextArea.css");
		std_exceptFiles.add("grid/Grid.css");
		std_exceptFiles.add("tab/Tab.css");
		std_exceptFiles.add("spinner/Spinner.css");
//		exceptFiles.add("upload/upload.css");
		
		//local files
//		exceptLocalFiles.add("base/highcharts.src.js");
//		exceptLocalFiles.add("datefield/DateField_temp.js");
//		exceptLocalFiles.add("tab/tab_close2.gif");
		
		touch_exceptFiles.add("base/touch.js");
		touch_exceptFiles.add("base/touch-all-min.css");
		touch_exceptFiles.add("base/zepto.js");
		touch_exceptFiles.add("base/zepto.min.js");
	}

	public static void main(String[] args) {
		BuildAll ba = new BuildAll();
		try {
			ba.delete();
			ba.buildUI();
			ba.buildResource();
			ba.buildZip();
//			//ba.buildJar();
			ba.delete();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private List buildUI() throws IOException {
		List files = new ArrayList();
		File fromDir = new File(SRC_DIR + STD_DIR);
		File toDir = new File(BUILD_DIR + STD_DIR);
		toDir.mkdirs();
		buildUIFiles(fromDir, toDir);
		
		File fromDir2 = new File(SRC_DIR + TOUCH_DIR);
		File toDir2 = new File(BUILD_DIR + TOUCH_DIR);
		toDir2.mkdirs();
		buildUIFiles(fromDir2, toDir2);
		return files;
	}
	
	private List buildResource() throws IOException {
		List files = new ArrayList();
		File fromDir = new File(STD_THEME_DIR);
		File toDir = new File(BUILD_DIR + RESOURCE_DIR + STD_DIR);
		toDir.mkdirs();
		buildResourceFiles(fromDir, toDir, std_exceptFiles);
		processResourceFiles();
		
		File fromDir2 = new File(TOUCH_THEME_DIR);
		File toDir2 = new File(BUILD_DIR + RESOURCE_DIR + TOUCH_DIR);
		toDir2.mkdirs();
		buildResourceFiles(fromDir2, toDir2, std_exceptFiles);
		return files;
	}

	private void buildZip() throws IOException {
		
		File direct = new File(BUILD_DIR);
		direct.mkdirs();
		String fileName = ZIP+ ".zip";//+ "-" +currentDate 
		ZipOutputStream zout = new ZipOutputStream(new FileOutputStream(new File(direct, fileName)));
		writeZip(new File(BUILD_DIR, STD_DIR), zout,BUILD_DIR);
		writeZip(new File(BUILD_DIR, TOUCH_DIR), zout,BUILD_DIR);
		zout.finish();

		fileName = ZIP_RESOURCE+ ".zip";//+ "-" + currentDate 
		zout = new ZipOutputStream(new FileOutputStream(new File(direct,fileName)));
		writeZip(new File(BUILD_DIR+RESOURCE_DIR,STD_DIR), zout,BUILD_DIR+RESOURCE_DIR);
		writeZip(new File(BUILD_DIR+RESOURCE_DIR, TOUCH_DIR), zout,BUILD_DIR+RESOURCE_DIR);
		zout.finish();
	}
	
	
//	private void buildJar() throws IOException{
//		String command="cmd /c jar cvf aurora-"+currentDate+".jar -C "+AURORA_DIR;
//		Runtime.getRuntime().exec(command);
//	}
	
	
	private void delete(){
		deleteAll(new File(BUILD_DIR + STD_DIR));
		deleteAll(new File(BUILD_DIR + TOUCH_DIR));
		deleteAll(new File(BUILD_DIR + ZIP));
		deleteAll(new File(BUILD_DIR + RESOURCE_DIR));
	}
	
	private void deleteAll(File direct){
		if(direct.isFile()){
			direct.delete();
		}else{
			File[] files=direct.listFiles();
			if(files!=null)
			for(int i=0;i<files.length;i++){
				deleteAll(files[i]);
			}
			direct.delete();
		}
	}
	
	private void writeZip(File file, ZipOutputStream zout,String path) throws IOException {
		File[] files = file.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory()) {
				writeZip(files[i], zout,path);
			} else {
				FileInputStream fis = new FileInputStream(files[i]);
				zout.putNextEntry(new ZipEntry(files[i].getPath().substring(
						path.length())));
				byte[] buf = new byte[1024];
				int begin;
				while ((begin = fis.read(buf)) != -1) {
					zout.write(buf, 0, begin);
				}
				fis.close();
			}
		}
	}
	
	private void copyFile(File src,File dest) throws IOException{
		File newFile = new File(dest, src.getName());
		FileInputStream fis = new FileInputStream(src);
		FileOutputStream fos = new FileOutputStream(newFile);
		byte[] buf = new byte[1024];
		int begin;
		while ((begin = fis.read(buf, 0, 1024)) != -1) {
			fos.write(buf, 0, begin);
		}
		fis.close();
		fos.close();
	}
	
	private void copyFolder(File src,File dest) throws IOException{
		File[] files = src.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory() && !files[i].isHidden()) {
				String name = files[i].getName();
				File newDir = new File(dest, name);
				newDir.mkdirs();
				copyFolder(files[i], newDir);
				if (newDir.listFiles().length == 0) {
					newDir.delete();
				}
			} else if (files[i].isFile()) {
				copyFile(files[i],dest);
			}
		}
	}
	
	private void buildUIFiles(File fromParent, File toParent) throws IOException {
		copyFolder(fromParent,toParent);
	}
	
	private void buildResourceFiles(File fromParent, File toParent,List excludeFiles) throws IOException {
		File[] files = fromParent.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory() && !files[i].isHidden()) {
				String name = files[i].getName();
				if ("resource".equals(name)) {
					buildResourceFiles(files[i], toParent,excludeFiles);
					continue;
				} else if ("template".equals(name)) {
					continue;
				}
				File newDir = new File(toParent, files[i].getName());
				newDir.mkdirs();
				buildResourceFiles(files[i], newDir, excludeFiles);
				if (newDir.listFiles().length == 0) {
					newDir.delete();
				}
			} else if (files[i].isFile() && !isExclude(files[i],excludeFiles)) {
				copyFile(files[i],toParent);
			}
		}
		
	}
	
	private void processResourceFiles() throws IOException{
		File themeFolder = new File(BUILD_DIR + RESOURCE_DIR + STD_DIR);
		File[] themes = themeFolder.listFiles();
		File defaultTheme = null;
		List otherThemes = new ArrayList();
		for (int i = 0; i < themes.length; i++) {
			File theme = themes[i];
			String name = theme.getName();
			if("default".equals(name)){
				defaultTheme = theme;
			}else{
				otherThemes.add(name);
				theme.renameTo(new File(theme.getParent(),name+"_"));
			}
		}
		Iterator it = otherThemes.iterator();
		while(it.hasNext()){
			String t = (String)it.next();
			File dest = new File(themeFolder,t);
			dest.mkdir();
			copyFolder(defaultTheme,dest);
			File dest2 = new File(themeFolder,t+"_");
			copyFolder(dest2,dest);
			deleteAll(dest2);
		}
		
	}
	
	private boolean isExclude(File file,List exceptFiles) {
		Iterator it = exceptFiles.iterator();
		while (it.hasNext()) {
			String filePath = file.getAbsolutePath().replaceAll("\\\\", "/");
			if (filePath.indexOf((String)it.next()) != -1)
				return true;
		}
		return false;
	}
}
