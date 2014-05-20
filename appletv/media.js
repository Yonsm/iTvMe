if(!document.getElementByTagName)
{
	atv.Document.prototype.getElementById = function(id)
	{
		var elements = this.evaluateXPath("//*[@id='" + id + "']", this);
		return(elements && elements.length > 0) ? elements[0] : undefined;
	};

	atv.Element.prototype.getElementsByTagName = function(name)
	{
		return this.ownerDocument.evaluateXPath("descendant::" + name, this);
	};

	atv.Element.prototype.getElementByTagName = function(name)
	{
		var elements = this.getElementsByTagName(name);
		return(elements && elements.length > 0) ? elements[0] : undefined;
	};
}

function baseURL()
{
	var src = document.rootElement.getElementByTagName("script").getAttribute('src');
	return src.substring(0, src.lastIndexOf('/') + 1);
}

function makeXML(body, head)
{
	var xml = '<?xml version="1.0" encoding="UTF-8"?><atv>' + (head ? ('<head>' + head + '</head>') : '') + '<body>' + body + '</body></atv>';
	return atv.parseXML(xml);
}

function makeError(msg, desc)
{
	return makeXML('<dialog id="error"><title><![CDATA[' + (msg || '') + ']]></title><description><![CDATA[' + (desc || '') + ']]></description></dialog>');
}

function quoteXML(s)
{
	return s.replace(/[&<>'"]/g, function(c)
	{
		return "&" + {
			"&": "amp",
			"<": "lt",
			">": "gt",
			"'": "apos",
			'"': "quot"
		}[c] + ";"
	})
}

function urlTitle(url)
{
	var dir = (url.charAt(url.length - 1) == '/');
	if(dir) url = url.substring(0, url.length - 1);
	var title = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
	if(!dir)
	{
		var pos = title.lastIndexOf('.');
		if(pos != -1)
		{
			title = title.substring(0, pos);
		}
	}
	return title;
}

function decodeGBK(I)
{
	O = '';
	g = atv.localStorage['gbk'];
	var i = 0;
	while(i < I.length)
	{
		c = I[i];
		i++;
		h = c.charCodeAt(0);
		if(h < 0x80)
		{
			O = O + c;
		}
		else
		{
			l = I.charCodeAt(i);
			i++;
			if(h >= 0xa1 && h <= 0xa9 && l >= 0xa1 && l <= 0xfe)
			{
				O = O + g.charAt((h - 0xa1) * 94 + (l - 0xa1));
			}
			else if(h >= 0xb0 && h <= 0xf7 && l >= 0xa1 && l <= 0xfe)
			{
				O = O + g.charAt((h - 0xb0) * 94 + (l - 0xa1) + 846);
			}
			else if(h >= 0x81 && h <= 0xA0 && l >= 0x40 && l <= 0xFE)
			{
				O = O + g.charAt((h - 0x81) * 190 + (l - 0x40) - (l > 0x7F ? 1 : 0) + 846 + 6768);
			}
			else if(h >= 0xAA && h <= 0xFE && l >= 0x40 && l <= 0xA0)
			{
				O = O + g.charAt((h - 0xAA) * 96 + (l - 0x40) - (l > 0x7F ? 1 : 0) + 846 + 6768 + 6080);
			}
			else if(h >= 0xA8 && h <= 0xA9 && l >= 0x40 && l <= 0xA0)
			{
				O = O + g.charAt((h - 0xA8) * 96 + (l - 0x40) - (l > 0x7F ? 1 : 0) + 846 + 6768 + 6080 + 8160);
			}
		}
	}
	return O;
}

function decodeBase64(I)
{
	var k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		O = "",
		chr1, chr2, chr3 = "",
		enc1, enc2, enc3, enc4 = "",
		i = 0,
		I = I.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	do {
		enc1 = k.indexOf(I.charAt(i++));
		enc2 = k.indexOf(I.charAt(i++));
		enc3 = k.indexOf(I.charAt(i++));
		enc4 = k.indexOf(I.charAt(i++));
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		O = O + String.fromCharCode(chr1);
		if(enc3 != 64)
		{
			O = O + String.fromCharCode(chr2);
		}
		if(enc4 != 64)
		{
			O = O + String.fromCharCode(chr3);
		}
		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";
	} while (i < I.length);
	return unescape(O);
}

function httpRequest(url, callback, body, headers, utf8)
{
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
	{
		try
		{
			if(req.readyState == 4)
			{
				if(req.status == 200)
				{
					var text = req.responseText;
					if(!text & req.responseDataAsBase64.length > 0)
					{
						g = atv.localStorage['gbk'];
						if(!g)
						{
							httpRequest(baseURL() + 'gbk.txt', function(res)
							{
								atv.localStorage['gbk'] = res;
								if(utf8 == 1) text = decodeBase64(req.responseDataAsBase64);
								else text = decodeGBK(decodeBase64(req.responseDataAsBase64));
								if(callback) callback(text);
							});
							return;
						};
						if(utf8 == 1) text = decodeBase64(req.responseDataAsBase64);
						else text = decodeGBK(decodeBase64(req.responseDataAsBase64));
					};
					if(callback) callback(text);
				}
				else
				{
					if(callback) callback();
				}
			}
		}
		catch(e)
		{
			req.abort();
			if(callback) callback();
		}
	};
	req.open((body ? "POST" : "GET"), url, true);
	if(headers) for(var key in headers) req.setRequestHeader(key, headers[key]);
	req.send(body);
	return req;
};

function playItem(url, list_count, sub_count)
{
	var desc = '文件位置：' + decodeURIComponent(url);
	if(sub_count) desc += '\n' + '外挂字幕：' + sub_count + ' 句';
	if(list_count) desc += '\n' + '播放列表：' + list_count + ' 项';

	var item = {
		type: 'video-asset',
		'media-asset': {
			'media-url': url,
			type: 'http-live-streaming',
			title: urlTitle(url),
			description: desc,
		}
	};
	return item;
}

function playFile(url, list, sub)
{
	var item = playItem(url, list ? (list.length + 1) : 0, sub ? (sub.length + 1) : 0);
	if(sub && sub.length) item['subtitle'] = sub;
	if(list && list.length) item['playlist'] = list;
	atv.loadPlist(item);
}

function loadFile(url, list)
{
	function subt(sts)
	{
		var sa = sts.split(',');
		var sec = sa[0];
		if(sa.length > 1)
		{
			ml = parseInt(sa[1], 10);
		}
		else ml = 0;
		ta = sec.split(':');
		if(ta.length == 3)
		{
			secs = parseInt(ta[0], 10) * 3600 + parseInt(ta[1], 10) * 60 + parseInt(ta[2], 10);
		}
		else if(ta.length == 2)
		{
			secs = parseInt(ta[0], 10) * 60 + parseInt(ta[1], 10);
		}
		else secs = parseInt(ta[0], 10);
		return secs + (ml / 1000.0);
	};

	var pos = url.lastIndexOf('.');
	var key = url.substring(0, pos);
	var srtlist = atv.sessionStorage['srtlist'];
	for(var i in srtlist)
	{
		var srt = srtlist[i];
		if((pos < srt.length) && (key == srt.substring(0, pos)))
		{
			httpRequest(srt, function(res)
			{
				var sub = [];
				if(res)
				{
					var lines = res.replace(/\r/g, '').split('\n\n');
					for(var i = 0; i < lines.length; i++)
					{
						var subline = lines[i].split('\n');
						var subid = subline.shift();
						if(!subid) continue;
						var subtime = subline.shift();
						if(!subtime) continue;
						var sta = subtime.split('-->');
						var startt = subt(sta[0]);
						var endt = subt(sta[1]);
						var subinfo = subline.join('\n').replace('\\N', '\n');
						sub.push([subid, startt, endt, subinfo]);
					}
				}
				playFile(url, list, sub);
			});
			return;
		}
	}

	playFile(url, list);
}

function loadFiles(url)
{
	var playlist = [];
	var behind = false;
	var filelist = atv.sessionStorage['filelist'];
	for(var i in filelist)
	{
		if(behind)
		{
			playlist.push(playItem(filelist[i], filelist.length - i));
		}
		else if(filelist[i] === url)
		{
			behind = true;
		}
	}

	loadFile(url, playlist);
}

function makeMedia(url, text)
{
	// 
	var sbase = baseURL();
	var base = url.substring(0, url.lastIndexOf('/') + 1);
	var host = url.substring(0, url.indexOf('/', 8));

	//
	var srtlist = [];
	var filelist = [];
	var posters = '';
	var photos = '';
	var posters_count = 0;
	var photos_count = 0;

	if(text != null)
	{
		// Split text to blocks
		var blocks = text.split('</tr>');
		if(blocks.length < 2) blocks = text.split('</li>');
		if(blocks.length < 2) blocks = text.split('<br>');
		if(blocks.length < 2) blocks = text.split('\n');

		// Parse dir, file or thumb items
		var dirs = [];
		var files = [];
		var thumbs = [];
		for(var i in blocks)
		{
			var re = new RegExp('<a href="(.*?)">(.*?)</a>', 'i');
			var rs = re.exec(blocks[i]);
			if(rs)
			{
				var href = rs[1];
				if(href.indexOf(':') == -1)
				{
					if(href.charAt(0) == '/') href = host + href;
					else href = base + href;
				}

				if(href.indexOf('.thumb.') != -1)
				{
					thumbs.push(href);
				}
				else
				{
					var name = rs[2].replace(/^\s+/, '').replace(/\s+$/, ''); // Trim prefix and sufix space
					if((name.charAt(0) != '.') && (name.indexOf('Parent Directory') == -1))
					{
						if(href.charAt(href.length - 1) == '/')
						{
							dirs.push([href, name]);
						}
						else
						{
							files.push([href, name]);
						}
					}
				}
			}
		}

		var nothumb = false;
		function fetchThumb(thumbs, sbase, href, type)
		{
			// Fetch image
			var pos = href.lastIndexOf('/');
			var key = (pos != -1) ? href.substring(pos + 1) : href;
			for(var i in thumbs)
			{
				if(thumbs[i].indexOf(key) != -1)
				{
					return thumbs[i];
				}
			}
			if(type != 'dir') nothumb = true;
			return type ? (sbase + 'image/' + type + '.png') : href;
		}

		function makePoster(thumbs, sbase, id, name, href, type, play, select)
		{
			// Make poster
			poster = '<moviePoster alwaysShowTitles="true" id="' + type + id + '" onPlay="' + play + '" onSelect="' + select + '">';
			poster += '<title>' + quoteXML(name) + '</title>';
			poster += '<image>' + quoteXML(fetchThumb(thumbs, sbase, href, type)) + '</image>';
			poster += '<defaultImage>resource://Poster.png</defaultImage>';
			poster += '</moviePoster>';
			return poster;
		}

		// Make dir item
		for(var i in dirs)
		{
			var href = dirs[i][0];
			var name = dirs[i][1];

			var action = 'loadPage(\'' + quoteXML(href) + '\')';
			if(name.charAt(name.length - 1) == '/') name = name.substring(0, name.length - 1);
			posters += makePoster(thumbs, sbase, ++posters_count, name, href.substring(0, href.length - 1), 'dir', action, action);
		}

		// Make file item
		for(var i in files)
		{
			var href = files[i][0];
			var name = files[i][1];
			var type = href.substring(href.lastIndexOf('.') + 1).toLowerCase();
			if(type == 'mov' || type == 'mp4' || type == 'm4v' || type == 'mkv' || type == 'mpg' || type == 'avi' || type == 'm3u' || type == 'mp3' || type == 'aac')
			{
				filelist.push(href);

				var pos = name.lastIndexOf('.');
				if(pos != -1) name = name.substring(0, pos);

				var play = 'loadFiles(\'' + quoteXML(href) + '\')';
				var select = 'loadFile(\'' + quoteXML(href) + '\')';
				posters += makePoster(thumbs, sbase, ++posters_count, name, href, type, play, select);
			}
			else if(type == 'jpg' || type == 'png' || type == 'gif' || type == 'bmp')
			{
				var id = type + ++photos_count;
				photos += '<photo id="' + id + '" onSelect="onPhotoSelection(\'' + id + '\')" onPlay="onSlideshowStart(\'' + id + '\')">';
				photos += '<assets><photoAsset width="0" height="0" src="' + quoteXML(fetchThumb(thumbs, sbase, href)) + '"/></assets>';
				photos += '</photo>';
			}
			else if(type == 'srt')
			{
				srtlist.push(href);
			}
		}

		// Request for thumbnail on server
		if(nothumb)
		{
			var uri = url.substring(url.indexOf('/', 8) + 1);
			var pos = uri.indexOf('?');
			if(pos != -1) uri = uri.substring(0, pos);
			pos = uri.indexOf('#');
			if(pos != -1) uri = uri.substring(0, pos);
			if(uri.indexOf('TEMP') == -1)
			{
				httpRequest(sbase + 'thumb.cgi?' + uri);
			}
		}
	}
	atv.sessionStorage['srtlist'] = srtlist;
	atv.sessionStorage['filelist'] = filelist;

	//
	if(photos_count == 0 && posters_count == 0)
	{
		return makeError('没有内容', decodeURIComponent(url));
	}

	// Geenrate XML
	var body;
	var head = '<script id="media.js" src="' + sbase + 'media.js"/>';
	if(photos_count > posters_count)
	{
		head += '<script src="' + sbase + 'slide.js"/>';
		body = '<mediaBrowser id="browser" gridLayout="mixed">';
		body += '<header><headerWithCountAndButtons><title>' + urlTitle(url) + '</title><count>' + photos_count + '</count>';
		body += '<buttons><actionButton id="slideshow" onSelect="onSettingsSelection()" onPlay="onSlideshowStart()"><title>幻灯片播放</title></actionButton></buttons>';
		body += '</headerWithCountAndButtons></header><items>' + photos + '</items></mediaBrowser>';
	}
	else
	{
		body = '<scroller id="scroller"><items><grid columnCount="5" id="grid"><items>' + posters + '</items></grid></items></scroller>';
	}

	return makeXML(body, head);
}

function loadDoc(doc, event)
{
	if(event) event.success(doc);
	else atv.loadXML(doc);
}

function loadPage(url, event)
{
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
	{
		try
		{
			if(req.readyState == 4)
			{
				loadDoc((req.status == 200) ? ((url.indexOf('.xml') != -1) ? req.responseXML : makeMedia(url, req.responseText)) : makeError('状态错误：' + req.status, url), event);
			}
		}
		catch(e)
		{
			req.abort();
			loadDoc(makeError(e, url), event);
		}
	}
	req.open('GET', url, true);
	req.send();
}

function loadItem(event)
{
	var id = event.navigationItemId;
	var item = document.getElementById(id);
	var url = item.getElementByTagName('url').textContent;
	loadPage(url, event);
}