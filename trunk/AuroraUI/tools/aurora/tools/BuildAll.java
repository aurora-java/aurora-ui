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
	private static final String RESOURCE_DIR = "resource/";
	private static final String BUILD_DIR = "build/";
	private static final String THEME_DIR = "src/aurora.ui.std/theme/";
	private static final String DEFAULT_DIR = "default/resource/";

	private static final String ZIP_STD = "aurora.ui.std";
	private static final String ZIP_RESOURCE = "resource";
	
	private List exceptFiles = new ArrayList();
	private List exceptLocalFiles = new ArrayList();

	public BuildAll() {
		exceptFiles.add("base/ext-core.js");
		exceptFiles.add("base/Aurora.js");
		exceptFiles.add("base/DataSet.js");
		exceptFiles.add("base/Component.js");
		exceptFiles.add("base/Field.js");
		exceptFiles.add("base/Box.js");
		exceptFiles.add("base/ImageCode.js");
		exceptFiles.add("base/Label.js");
		exceptFiles.add("base/Layout.js");
		exceptFiles.add("base/Customization.js");
		exceptFiles.add("button/Button.js");
		exceptFiles.add("checkbox/CheckBox.js");
		exceptFiles.add("radio/Radio.js");
		exceptFiles.add("textfield/TextField.js");
		exceptFiles.add("numberfield/NumberField.js");
		exceptFiles.add("base/TriggerField.js");
		exceptFiles.add("combo/ComboBox.js");
		exceptFiles.add("datefield/DateField.js");
		exceptFiles.add("datefield/DatePicker.js");
		exceptFiles.add("datefield/DateTimePicker.js");
		exceptFiles.add("toolbar/ToolBar.js");
		exceptFiles.add("window/Window.js");
		exceptFiles.add("lov/Lov.js");
		exceptFiles.add("lov/MultiLov.js");
		exceptFiles.add("textarea/TextArea.js");
		exceptFiles.add("chart/Adapter.js");
		exceptFiles.add("chart/Chart.js");
		exceptFiles.add("chart/Exporting.js");
		exceptFiles.add("spinner/Spinner.js");

		exceptFiles.add("base/Aurora.css");
		exceptFiles.add("base/Aurora-all.css");
		exceptFiles.add("checkbox/CheckBox.css");
		exceptFiles.add("radio/Radio.css");
		exceptFiles.add("button/Button.css");
		exceptFiles.add("textfield/TextField.css");
		exceptFiles.add("numberfield/NumberField.css");
		exceptFiles.add("combo/ComboBox.css");
		exceptFiles.add("datefield/DateField.css");
		exceptFiles.add("toolbar/ToolBar.css");
		exceptFiles.add("window/Window.css");
		exceptFiles.add("lov/Lov.css");
		exceptFiles.add("textarea/TextArea.css");
		exceptFiles.add("grid/Grid.css");
		exceptFiles.add("tab/Tab.css");
		exceptFiles.add("spinner/Spinner.css");
//		exceptFiles.add("upload/upload.css");
		
		//local files
//		exceptLocalFiles.add("base/highcharts.src.js");
//		exceptLocalFiles.add("datefield/DateField_temp.js");
//		exceptLocalFiles.add("tab/tab_close2.gif");
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
		copyFiles(fromDir, toDir, false, false);
		return files;
	}

	private List buildResource() throws IOException {
		List files = new ArrayList();
		File fromDir = new File(THEME_DIR);
		File toDir = new File(BUILD_DIR + RESOURCE_DIR + STD_DIR);
		toDir.mkdirs();
		copyFiles(fromDir, toDir, true, true);
		return files;
	}

	private void buildZip() throws IOException {
		
		File direct = new File(BUILD_DIR);
		direct.mkdirs();
		String fileName = ZIP_STD+ ".zip";//+ "-" +currentDate 
		ZipOutputStream zout = new ZipOutputStream(new FileOutputStream(
				new File(direct, fileName)));
		writeZip(new File(BUILD_DIR, STD_DIR), zout);
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

	private void copyFiles(File fromParent, File toParent, boolean include,
			boolean specialDir) throws IOException {
		File[] files = fromParent.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory() && !files[i].isHidden()) {
				if (specialDir) {
					String name = files[i].getName();
					if ("resource".equals(name)) {
						copyFiles(files[i], toParent, true, false);
						continue;
					} else if ("template".equals(name)) {
						continue;
					}
					File newDir = new File(toParent, files[i].getName());
					newDir.mkdirs();
					copyFiles(files[i], newDir, true, true);
					if (newDir.listFiles().length == 0) {
						newDir.delete();
					}
				} else {
					File newDir = new File(toParent, files[i].getName());
					newDir.mkdirs();
					copyFiles(files[i], newDir, false, false);
					if (newDir.listFiles().length == 0) {
						newDir.delete();
					}
				}
			} else if (files[i].isFile() && !includeFile(files[i],exceptLocalFiles) && (include || !includeFile(files[i],exceptFiles))) {
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

	private boolean includeFile(File file,List exceptFiles) {
		Iterator it = exceptFiles.iterator();
		while (it.hasNext()) {
			if (new File(THEME_DIR + DEFAULT_DIR + (String) it.next())
					.compareTo(file) == 0)
				return true;
		}
		return false;
	}

}
