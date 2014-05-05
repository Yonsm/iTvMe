function showSub(line, li)
{
	fsize = 40;
	heigp = 0.075;
	wchar = 64;

	li = li || 0;
	line = line.replace(/<[^>]*>/g, '');
	llen = 0;
	for(var i = 0; i < line.length; i++) if(line.charCodeAt(i) > 255) llen = llen + 2;
	else llen = llen + 1;
	if(llen < wchar)
	{
		for(var j = 0; j < (wchar - llen) / 2; j++) line = ' ' + line;
	};
	if(!atv.player.overlay)
	{
		var rootV = new atv.View();
		rootV.subviews = [];
		atv.player.overlay = rootV;
	};
	var vfound = -1;
	for(var i = 0; i < atv.player.overlay.subviews.length; i++)
	{
		if(atv.player.overlay.subviews[i].attributedString.name == 'subtitle' + li)
		{
			vfound = i;
			break;
		}
	};
	var messageAttributes = {
		pointSize: fsize,
		color: {
			red: 1,
			blue: 1,
			green: 1
		}
	};
	if(vfound == -1)
	{
		var screenFrame = atv.device.screenFrame;
		var overlayHeight = screenFrame.height * heigp;
		var overlayWidth = screenFrame.width * 0.8;
		var overlay = new atv.TextView();
		overlay.frame = {
			x: screenFrame.width * 0.1,
			y: (0.5 + li) * overlayHeight,
			width: overlayWidth,
			height: overlayHeight
		};
		overlay.backgroundColor = {
			red: 0.188,
			green: 0.188,
			blue: 0.188,
			alpha: 0
		};
		overlay.attributedString = {
			string: line,
			attributes: messageAttributes,
			name: 'subtitle' + li
		};
		oldv = atv.player.overlay.subviews;
		oldv.push(overlay);
		atv.player.overlay.subviews = [];
		atv.player.overlay.subviews = oldv;
	}
	else
	{
		atv.player.overlay.subviews[vfound].attributedString = {
			string: line,
			attributes: messageAttributes,
			name: 'subtitle' + li
		};
	}
}

function hideSub()
{
	try
	{
		if(!atv.player.overlay) return;
		var messageAttributes = {
			pointSize: 32.0,
			color: {
				red: 1,
				blue: 1,
				green: 1
			}
		};
		for(var i = 0; i < atv.player.overlay.subviews.length; i++)
		{
			if(atv.player.overlay.subviews[i].attributedString.name.substring(0, 8) == 'subtitle')
			{
				var s = atv.player.overlay.subviews[i].attributedString.name;
				atv.player.overlay.subviews[i].attributedString = {
					string: "",
					attributes: messageAttributes,
					name: s
				};
			}
		}
	}
	catch(e)
	{
		atv.loadAndSwapXML(makeError(e));
	}
}

atv.player.playerTimeDidChange = function(time)
{
	var sub = atv.player.asset['subtitle'];
	if(!sub || !sub.length) return;

	if(lastSubS != -1 && time >= lastSubS && time <= lastSubE) return;
	var bs = 0,
		es = sub.length,
		mp, startt, endt;
	var found = 0,
		fs = 0;
	var ccount = 0;
	while(bs < es)
	{
		ccount++;
		if(ccount > 20) break;
		mp = Math.floor((bs + es) / 2);
		startt = sub[mp][1];
		endt = sub[mp][2];
		if(startt <= time && endt >= time)
		{
			found = 1;
			fs = mp;
			break;
		};
		if(startt >= time)
		{
			es = mp;
			continue;
		};
		if(endt <= time)
		{
			bs = mp + 1;
			continue;
		};
		break;
	};
	if(found == 1)
	{
		lines = sub[fs][3].split('\n');
		if(lines.length == 1)
		{
			showSub('', 3);
			showSub('', 2);
			showSub(lines[0], 1);
			showSub('', 0);
		}
		else if(lines.length == 2)
		{
			showSub('', 3);
			showSub('', 2);
			showSub(lines[0], 1);
			showSub(lines[1], 0);
		}
		else if(lines.length == 3)
		{
			showSub('', 3);
			showSub(lines[0], 2);
			showSub(lines[1], 1);
			showSub(lines[2], 0);
		}
		else if(lines.length == 4)
		{
			showSub(lines[0], 3);
			showSub(lines[1], 2);
			showSub(lines[2], 1);
			showSub(lines[3], 0);
		};
		lastSubS = sub[fs][1];
		lastSubE = sub[fs][2];
	}
	else
	{
		hideSub();
	}
};

atv.player.willStartPlaying = function()
{
	if(atv.player.asset['playlist'])
	{
		atv.player.loadMoreAssets = function(callback)
		{
			list = [];
			var playlist = atv.player.asset['playlist'];
			for(var i in playlist) list.push(playlist[i]);
			return atv.setTimeout(function()
			{
				callback.success(list);
			}, 1000);
		};
	}

	if(atv.player.asset['subtitle'])
	{
		lastTime = 0;
		lastSubS = -1;
		lastSubE = -1;

		var overlay = new atv.View();
		overlay.subviews = [];
		atv.player.overlay = overlay;
	}
};

atv.config = {
	"doesJavaScriptLoadRoot": true,
};

atv.onAppEntry = function()
{
    atv.loadURL('http://atv.qello.com/appletv/index.xml');
}
