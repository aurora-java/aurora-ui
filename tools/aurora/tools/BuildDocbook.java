package aurora.tools;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Iterator;

import javax.xml.transform.Templates;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.io.FileUtils;

public class BuildDocbook {
	private static TransformerFactory factory;
	private static Templates tempaltes;
	private static String TEMPLATE_PATH = "/usr/workspace/aurora_build/docbook-xsl-1.76.1/html/docbook.xsl";
	private static String DATH_PATH = "documents/docbook/html";
	private static String SOURCE_PATH = "documents/docbook/";

	public BuildDocbook() {
		factory = TransformerFactory.newInstance();
		try {
			tempaltes = factory.newTemplates(new StreamSource(new File(
					TEMPLATE_PATH)));
		} catch (TransformerConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static void main(String[] args) throws TransformerException,
			IOException {
		BuildDocbook bd = new BuildDocbook();
		ArrayList file_list = bd.getFileList(SOURCE_PATH);
		if (file_list.size() == 0)
			return;
		File direct = new File(DATH_PATH);
		FileUtils.forceMkdir(direct);
		Iterator itm = file_list.iterator();
		while (itm.hasNext()) {
			File file = (File) itm.next();
			String file_name = file.getName().replace(".xml", ".html");
			File dest = new File(direct, file_name);
			String content = bd.getContent(file.getAbsolutePath());
			bd.transformDocBook(dest, content);
		}

	}

	private void transformDocBook(File dest, String content)
			throws TransformerException {
		Transformer transformer = tempaltes.newTransformer();
		StringReader sr = new StringReader(content);
		transformer.transform(new StreamSource(sr), new StreamResult(dest));
	}

	private String getContent(String path) throws IOException {
		InputStream stream = null;
		Reader reader = null;
		try {
			File file = new File(path);
			StringBuffer sb = new StringBuffer();
			char[] tempchars = new char[30];
			int begin;
			reader = new InputStreamReader(new FileInputStream(file), "UTF-8");
			while ((begin = reader.read(tempchars)) != -1) {
				sb.append(new String(tempchars, 0, begin));
			}
			return sb.toString();
		} finally {
			if (reader != null)
				reader.close();
		}
	}

	private ArrayList getFileList(String strPath) {
		ArrayList filelist = new ArrayList();
		File dir = new File(strPath);
		File[] files = dir.listFiles();
		if (files == null)
			return filelist;
		for (int i = 0; i < files.length; i++) {
			if (isXML(files[i])) {
				filelist.add(files[i]);
			}
		}
		return filelist;
	}

	private static boolean isXML(File file) {
		String file_name = file.getName();
		int begin = file_name.lastIndexOf(".");
		if (begin < 0)
			return false;
		String suffix = file_name.substring(begin, file_name.length());
		if (suffix.equals(".xml"))
			return true;
		return false;
	}
}