
function medex()
{
	// Parse dir, file or thumb items
	var dirs = [];
	var files = [];
	var thumbs = [];
	var nodes = document.getElementsByTagName('a');
	for(var i in nodes)
	{
		var href = nodes[i].href;
		if (href == undefined) continue;
		
		if(href.indexOf('.thumb.') != -1)
		{
			thumbs.push(href);
		}
		else
		{
			var name = nodes[i].innerHTML;
			if((name.charAt(0) != '.'))
			{
				if(href.charAt(href.length - 1) == '/')
				{
					var cnames =
					{
  						'Parent Directory': '上一级',
  						'Books': '书籍',
  						'Downloads': '下载',
  						'Movies': '电影',
  						'Music': '音乐',
  						'Pictures': '照片',
  						'Software': '软件',
  						'Videos': '视频',
					};
					if(name.charAt(name.length - 1) == '/') name = name.substring(0, name.length - 1);
					
					var path = href;
					var pos = path.lastIndexOf("//");
					if(pos != -1) path = path.substring(pos + 2);
					pos = path.indexOf("/");
					if(pos != -1) path = path.substring(pos + 1);
					if(path.length)
					{
						var cname = cnames[name];
						dirs.push([href, cname ? cname : name]);
					}
				}
				else if (name.indexOf('.') != -1)
				{
					files.push([href, name]);
				}
			}
		}
	}

	var nothumb = false;
	function fetchThumb(href, type)
	{
		// Fetch image
		var pos = href.lastIndexOf('/');
		var key = (pos != -1) ? href.substring(pos + 1) : href;
		for(var i in thumbs)
		{
			var thumb = thumbs[i];
			var pos = thumb.lastIndexOf("/");
			if(pos != -1) thumb = thumb.substring(pos + 1)
			if(thumb.indexOf(key) != -1)
			{
				return thumbs[i];
			}
		}
		if(type != 'dir') nothumb = true;
		return type ? ('/appletv/image/' + type + '.png') : href;
	}

	//
	var items = '';
	var items_count = 0;
	var items_per_row = document.documentElement.clientWidth / 160 | 0;
	if (items_per_row < 1) items_per_row = 1;
	function addItems(name, href, type)
	{
		// Make poster
		if (items_count % items_per_row == 0)
		{
			items += '<tr>';
		}
		var thumb = (name == '上一级') ? ('/appletv/image/up.png') : fetchThumb(href, type);
		items += '<td width="160" height="180" align="center"><a id="' + type + items_count + '" href="' + href + '">';
		items += '<image width="134" src=' + thumb + '></image>';
		items += '<br>' + name;
		items += '</a></td>';
		items_count++;
		if (items_count % items_per_row == 0)
		{
			items += '</tr>';
		}
	}

	// Make dir item
	for(var i in dirs)
	{
		var href = dirs[i][0];
		var name = dirs[i][1];
		addItems(name, href.substring(0, href.length - 1), 'dir');
	}

	// Make file item
	for(var i in files)
	{
		var href = files[i][0];
		var name = files[i][1];
		var type = href.substring(href.lastIndexOf('.') + 1).toLowerCase();
		if(type != 'jpg' &&
		 type != 'png' && 
		 type != 'gif' && 
		 type != 'bmp' && 
		 type != 'mov' && 
		 type != 'mp4' && 
		 type != 'm4v' && 
		 type != 'mkv' && 
		 type != 'mpg' && 
		 type != 'avi' && 
		 type != 'm3u' && 
		 type != 'mp3' && 
		 type != 'aac')
		{

			type = 'def';
		}

		var pos = name.lastIndexOf('.');
		if(pos != -1) name = name.substring(0, pos);

		addItems(name, href, type);
	}

	// Request for thumbnail on server
	if(nothumb)
	{
		var path = location.href;
		var pos = path.lastIndexOf("//");
		if(pos != -1) path = path.substring(pos + 2);
		pos = path.indexOf("/");
		if(pos != -1) path = path.substring(pos + 1);
		items += '<tr><td align="center" height="100" colspan="' + items_per_row + '"><a href="/appletv/thumb.cgi?' + path + '">生成缩略图</a></td></tr>';
	}

	// Geenrate HTML
	return '<table align="center">' + items + '</table>';
}

document.body.innerHTML = medex();
