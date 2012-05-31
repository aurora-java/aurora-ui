package aurora.tools;

import java.io.File;
import java.io.FileInputStream;
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
	private static final String DEFAULT_DIR = "default/resource/";

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
		std_exceptFiles.add("button/Button.js");
		std_exceptFiles.add("checkbox/CheckBox.js");
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
		std_exceptFiles.add("lov/MultiLov.js");
		std_exceptFiles.add("textarea/TextArea.js");
		std_exceptFiles.add("chart/Adapter.js");
		std_exceptFiles.add("chart/Chart.js");
		std_exceptFiles.add("chart/Exporting.js");
		std_exceptFiles.add("spinner/Spinner.js");

		std_exceptFiles.add("base/Aurora.css");
		std_exceptFiles.add("base/Aurora-all.css");
		std_exceptFiles.add("checkbox/CheckBox.css");
		std_exceptFiles.add("radio/Radio.css");
		std_exceptFiles.add("button/Button.css");
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
			ba.buildSTD();
			ba.buildResource();
			ba.buildZip();
			//ba.buildJar();
			ba.delete();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private List buildSTD() throws IOException {
		List files = new ArrayList();
		File fromDir = new File(SRC_DIR + STD_DIR);
		File toDir = new File(BUILD_DIR + STD_DIR);
		toDir.mkdirs();
		copyFiles(fromDir, toDir, false, false,STD_THEME_DIR,std_exceptFiles);
		
		File fromDir2 = new File(SRC_DIR + TOUCH_DIR);
		File toDir2 = new File(BUILD_DIR + TOUCH_DIR);
		toDir2.mkdirs();
		copyFiles(fromDir2, toDir2, false, false,TOUCH_THEME_DIR,std_exceptFiles);
		return files;
	}

	private List buildResource() throws IOException {
		List files = new ArrayList();
		File fromDir = new File(STD_THEME_DIR);
		File toDir = new File(BUILD_DIR + RESOURCE_DIR + STD_DIR);
		toDir.mkdirs();
		copyFiles(fromDir, toDir, true, true,STD_THEME_DIR,std_exceptFiles);
		
		File fromDir2 = new File(TOUCH_THEME_DIR);
		File toDir2 = new File(BUILD_DIR + RESOURCE_DIR + TOUCH_DIR);
		toDir2.mkdirs();
		copyFiles(fromDir2, toDir2, true, true,TOUCH_THEME_DIR,std_exceptFiles);
		return files;
	}

	private void buildZip() throws IOException {
		
		File direct = new File(BUILD_DIR);
		direct.mkdirs();
		String fileName = ZIP+ ".zip";//+ "-" +currentDate 
		ZipOutputStream zout = new ZipOutputStream(new FileOutputStream(new File(direct, fileName)));
		writeZip(new File(BUILD_DIR, STD_DIR), zout);
		writeZip(new File(BUILD_DIR, TOUCH_DIR), zout);
		zout.finish();

		fileName = ZIP_RESOURCE+ ".zip";//+ "-" + currentDate 
		zout = new ZipOutputStream(new FileOutputStream(new File(direct,
				fileName)));
		writeZip(new File(BUILD_DIR, RESOURCE_DIR), zout);
		zout.finish();
	}
//	private void buildJar() throws IOException{
//		String command="cmd /c jar cvf aurora-"+currentDate+".jar -C "+AURORA_DIR;
//		Runtime.getRuntime().exec(command);
//	}
	private void delete(){
		deleteAll(new File(BUILD_DIR + STD_DIR));
		deleteAll(new File(BUILD_DIR + TOUCH_DIR));
		deleteAll(new File(BUILD_DIR + RESOURCE_DIR));
	}
	
	private void deleteAll(File direct){
		if(direct.isFile()){
			direct.delete();
		}else{
			File[] files=direct.listFiles();
			for(int i=0;i<files.length;i++){
				deleteAll(files[i]);
			}
			direct.delete();
		}
	}
	
	private void writeZip(File file, ZipOutputStream zout) throws IOException {
		File[] files = file.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory()) {
				writeZip(files[i], zout);
			} else {
				FileInputStream fis = new FileInputStream(files[i]);
				zout.putNextEntry(new ZipEntry(files[i].getPath().substring(
						BUILD_DIR.length())));
				byte[] buf = new byte[1024];
				int begin;
				while ((begin = fis.read(buf)) != -1) {
					zout.write(buf, 0, begin);
				}
				fis.close();
			}
		}
	}

	private void copyFiles(File fromParent, File toParent, boolean include, boolean specialDir,String dir,List list) throws IOException {
		File[] files = fromParent.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory() && !files[i].isHidden()) {
				if (specialDir) {
					String name = files[i].getName();
					if ("resource".equals(name)) {
						copyFiles(files[i], toParent, true, false,dir,list);
						continue;
					} else if ("template".equals(name)) {
						continue;
					}
					File newDir = new File(toParent, files[i].getName());
					newDir.mkdirs();
					copyFiles(files[i], newDir, true, true,dir,list);
					if (newDir.listFiles().length == 0) {
						newDir.delete();
					}
				} else {
					File newDir = new File(toParent, files[i].getName());
					newDir.mkdirs();
					copyFiles(files[i], newDir, false, false,dir,list);
					if (newDir.listFiles().length == 0) {
						newDir.delete();
					}
				}
			} else if (files[i].isFile() && !includeFile(files[i],STD_THEME_DIR,exceptLocalFiles) && (include || !includeFile(files[i],dir,list))) {
				File newFile = new File(toParent, files[i].getName());
				FileInputStream fis = new FileInputStream(files[i]);
				FileOutputStream fos = new FileOutputStream(newFile);
				byte[] buf = new byte[1024];
				int begin;
				while ((begin = fis.read(buf, 0, 1024)) != -1) {
					fos.write(buf, 0, begin);
				}
				fis.close();
				fos.close();
			}
		}
	}

	private boolean includeFile(File file,String dir, List exceptFiles) {
		Iterator it = exceptFiles.iterator();
		while (it.hasNext()) {
			if (new File(dir + DEFAULT_DIR + (String) it.next()).compareTo(file) == 0)
				return true;
		}
		return false;
	}

}
