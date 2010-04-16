<%@page contentType="text/html;charset=utf-8"%>
<%@page import="java.io.*,java.util.*,org.apache.commons.io.*"%><%
	String appPath = application.getRealPath("");
	File demoPath = new File(appPath, "demo");
	String fileName = request.getParameter("src");
	StringBuffer sb = new StringBuffer();
	if(fileName !=null){
		try {
			File file = new File(demoPath, fileName);
			if(file!=null){
				List lines = FileUtils.readLines(file, "UTF-8");
				for(int i=0;i<lines.size();i++) {
			    	String line = lines.get(i).toString();
			    	sb.append(line);
			    	sb.append("\n");
				}
			}
		}catch(Exception e){}
	}
%>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="images/code_style.css"/>
<script src="images/highlight.js"></script>
<script src="images/languages/html-xml.js"></script>
<script src="images/languages/javascript.js"></script>
<script>hljs.initHighlightingOnLoad();</script>
</head>
<body>
<textarea id="source_code_area" style="display:none;"><%=sb.toString()%></textarea>
<table class="code_table"><tr><td id="display_source_code"></td></tr></table>
<script>
	String.prototype.escape = function() {
        return this.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
    }
	function highlightSourceCode() {
	    var dsc = document.getElementById("display_source_code");
	    var sca = document.getElementById("source_code_area");
	    dsc.innerHTML = '<pre><code class="html">'+sca.value.escape()+"</code></pre>";	    
	    hljs.highlightBlock(dsc.firstChild.firstChild);
	}
	setTimeout(function(){
		highlightSourceCode();
	},100);
</script>
</body>