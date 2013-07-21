atv.config =
{ 
    "doesJavaScriptLoadRoot": true,
};

atv.onAppEntry = function()
{
    atv.localStorage["atvttvv"]='today';
    atv.loadURL('http://trailers.apple.com/appletv/index.xml');
}
