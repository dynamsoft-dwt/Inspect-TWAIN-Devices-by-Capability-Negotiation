var DWObject, supportedCapabilities, msgType, ctnType, txtReturnedOrToSet, textStatus = "";
var CurrentPathName = unescape(location.pathname);
var CurrentPath = CurrentPathName.substring(0, CurrentPathName.lastIndexOf("/") + 1);
var strHTTPServer = location.hostname;
var strActionPage;
var DynamsoftCapabilityNegotiation = {
    CurrentCapabilityHasBoolValue: false,
    tempFrame: '',
    tmpType: 0
};

window.onload = function () {
    if (Dynamsoft && (!Dynamsoft.Lib.product.bChromeEdition)) {
        var ObjString = [];
        ObjString.push('<div class="p15">');
        ObjString.push("Please note that your current browser is not supported, please use modern browsers like Chrome, Firefox, Edge or IE 11.");
        ObjString.push('</div>');
        Dynamsoft.DWT.ShowDialog(400, 180, ObjString.join(''));
        if (document.getElementsByClassName("dynamsoft-dialog-close"))
            document.getElementsByClassName("dynamsoft-dialog-close")[0].style.display = "none";
    } else {
        Dynamsoft.DWT.AutoLoad = false;
        Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer', Width: '100%', Height: '600px' }];
        Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady);
        /**
         * In order to use the full version, do the following
         * 1. Replace A-Valid-Product-Key with a full version key
         * 2. Change Dynamsoft.DWT.ResourcesPath to point to the full version 
         *    resource files that you obtain after purchasing a key
         */
        //Dynamsoft.DWT.ProductKey = "A-Valid-Product-Key";
        //Dynamsoft.DWT.ResourcesPath = "https://tst.dynamsoft.com/libs/dwt/17.0";
        Dynamsoft.DWT.ProductKey = 't00901wAAAFGokK55GCTHFf8RWZ8bKjNRD1O+Gf0xA6MUdkmYI6zSueLnBjy55bNxl/YW1HkZykS/h0xYHBuFFwIDbexR567425Cx3hnuwAewN5DyXtRd/ATLnyy+';
        Dynamsoft.DWT.ResourcesPath = 'https://unpkg.com/dwt/dist/';

        Dynamsoft.DWT.Load();
    }
};

function Dynamsoft_OnReady() {
    supportedCapabilities = document.getElementById("capabilities");
    msgType = document.getElementById("messageType");
    msgType.options.add(new Option("MSG_GET", Dynamsoft.DWT.EnumDWT_MessageType.TWQC_GET));
    msgType.options.add(new Option("MSG_SET", Dynamsoft.DWT.EnumDWT_MessageType.TWQC_SET));
    msgType.options.add(new Option("MSG_RESET", Dynamsoft.DWT.EnumDWT_MessageType.TWQC_RESET));
    msgType.options.selectedIndex = 1;
    ctnType = document.getElementById("containerType");
    ctnType.options.add(new Option("TWON_ARRAY", Dynamsoft.DWT.EnumDWT_CapType.TWON_ARRAY));
    ctnType.options.add(new Option("TWON_ENUMERATION", Dynamsoft.DWT.EnumDWT_CapType.TWON_ENUMERATION));
    ctnType.options.add(new Option("TWON_ONEVALUE", Dynamsoft.DWT.EnumDWT_CapType.TWON_ONEVALUE));
    ctnType.options.add(new Option("TWON_RANGE", Dynamsoft.DWT.EnumDWT_CapType.TWON_RANGE));
    ctnType.options.add(new Option("Not Supported", 0));
    txtReturnedOrToSet = document.getElementById('txtReturnedOrToSet');
    TrueOrFalse = document.getElementById('TrueOrFalse');

    DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    if (DWObject) {
		/*
		* List all available TWAIN deivces (scanners("etc.)
		*/
        DWObject.Width = 504;
        DWObject.Height = 599;
        var twainsource = document.getElementById("source");
        twainsource.options.length = 1;
        var vCount = DWObject.SourceCount;
        for (var i = 0; i < vCount; i++) {
            twainsource.options.add(new Option(DWObject.GetSourceNameItems(i), i));
        }
        DWObject.SetViewMode(2, 2);
    }
    DWObject.IfShowUI = false;
    DWObject.IfDisableSourceAfterAcquire = true;
}

function AcquireImage() {
    if (DWObject.DataSourceStatus != 1) {
        DWObject.SelectSourceByIndex(document.getElementById('source').value);
        DWObject.OpenSource();
    } else {
        var sel = document.getElementById('source');
        var num = parseInt(sel.value) + 1;
        if (sel.options[num].text != DWObject.CurrentSourceName) {
            DWObject.SelectSourceByIndex(document.getElementById('source').value);
            DWObject.OpenSource();
        }
    }
    var OnAcquireImageSuccess, OnAcquireImageFailure;
    OnAcquireImageSuccess = function () {
        DWObject.CloseSource();
        console.log('Scan Succeeded!');
    };
    OnAcquireImageFailure = function () {
        DWObject.CloseSource();
        alert('Scan Failed!');
    };
    DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageFailure);
}

function checkScanner() {
    if (document.getElementById('source').value == "") { alert("Please select a device first!"); return; }
    DWObject.SelectSourceByIndex(document.getElementById('source').value);
    DWObject.CloseSource();
    DWObject.SetOpenSourceTimeout(2000);
    DWObject.OpenSource();
    showCapabilites();
    DWObject.CloseSource();
}

function showCapabilites() {
    DWObject.Capability = Dynamsoft.DWT.EnumDWT_Cap.CAP_SUPPORTEDCAPS;    //CAP_SUPPORTEDCAPS
    if (DWObject.CapGet()) {
        var supportedCount = DWObject.CapNumItems;
        UpdateInfo('How Many Capabilities Does it Support?', false); UpdateInfo(supportedCount, true);
        supportedCapabilities.options.length = 1;
        supportedCapabilities.options[0].innerText = "All Supported Capabilites Updated";
        for (var i = 0; i < supportedCount; i++) {
            var capHexValue = parseInt(DWObject.GetCapItems(i));
            if (capHexValue == 0x1005) continue;
            switch (capHexValue) {
                case 0x8000: supportedCapabilities.options.add(new Option("(1.0) [0x8000] CAP_CUSTOMBASE", 0x8000)); break;
                case 0x0001: supportedCapabilities.options.add(new Option("(1.0) [0x0001] CAP_XFERCOUNT", 0x0001)); break;
                case 0x0100: supportedCapabilities.options.add(new Option("(1.0) [0x0100] ICAP_COMPRESSION", 0x0100)); break;
                case 0x0101: supportedCapabilities.options.add(new Option("(1.0) [0x0101] ICAP_PIXELTYPE", 0x0101)); break;
                case 0x0102: supportedCapabilities.options.add(new Option("(1.0) [0x0102] ICAP_UNITS", 0x0102)); break;
                case 0x0103: supportedCapabilities.options.add(new Option("(1.0) [0x0103] ICAP_XFERMECH", 0x0103)); break;
                case 0x1000: supportedCapabilities.options.add(new Option("(1.0) [0x1000] CAP_AUTHOR", 0x1000)); break;
                case 0x1001: supportedCapabilities.options.add(new Option("(1.0) [0x1001] CAP_CAPTION", 0x1001)); break;
                case 0x1002: supportedCapabilities.options.add(new Option("(1.0) [0x1002] CAP_FEEDERENABLED", 0x1002)); break;
                case 0x1003: supportedCapabilities.options.add(new Option("(1.0) [0x1003] CAP_FEEDERLOADED", 0x1003)); break;
                case 0x1004: supportedCapabilities.options.add(new Option("(1.0) [0x1004] CAP_TIMEDATE", 0x1004)); break;
                //case 0x1005: supportedCapabilities.options.add(new Option("(1.0) [0x1005] CAP_SUPPORTEDCAPS", 0x1005)); break;
                case 0x1006: supportedCapabilities.options.add(new Option("(1.0) [0x1006] CAP_EXTENDEDCAPS", 0x1006)); break;
                case 0x1007: supportedCapabilities.options.add(new Option("(1.0) [0x1007] CAP_AUTOFEED", 0x1007)); break;
                case 0x1008: supportedCapabilities.options.add(new Option("(1.0) [0x1008] CAP_CLEARPAGE", 0x1008)); break;
                case 0x1009: supportedCapabilities.options.add(new Option("(1.0) [0x1009] CAP_FEEDPAGE", 0x1009)); break;
                case 0x100A: supportedCapabilities.options.add(new Option("(1.0) [0x100a] CAP_REWINDPAGE", 0x100A)); break;

                case 0x100B: supportedCapabilities.options.add(new Option("(1.1) [0x100b] CAP_INDICATORS", 0x100B)); break;
                case 0x100B: supportedCapabilities.options.add(new Option("(1.6) [0x100c] CAP_SUPPORTEDCAPSEXT", 0x100C)); break;
                case 0x100D: supportedCapabilities.options.add(new Option("(1.6) [0x100d] CAP_PAPERDETECTABLE", 0x100D)); break;
                case 0x100E: supportedCapabilities.options.add(new Option("(1.6) [0x100e] CAP_UICONTROLLABLE", 0x100E)); break;
                case 0x100F: supportedCapabilities.options.add(new Option("(1.6) [0x100f] CAP_DEVICEONLINE", 0x100F)); break;
                case 0x1010: supportedCapabilities.options.add(new Option("(1.6) [0x1010] CAP_AUTOSCAN", 0x1010)); break;

                case 0x1011: supportedCapabilities.options.add(new Option("(1.7) [0x1011] CAP_THUMBNAILSENABLED", 0x1011)); break;
                case 0x1012: supportedCapabilities.options.add(new Option("(1.7) [0x1012] CAP_DUPLEX", 0x1012)); break;
                case 0x1013: supportedCapabilities.options.add(new Option("(1.7) [0x1013] CAP_DUPLEXENABLED", 0x1013)); break;
                case 0x1014: supportedCapabilities.options.add(new Option("(1.7) [0x1014] CAP_ENABLEDSUIONLY", 0x1014)); break;
                case 0x1015: supportedCapabilities.options.add(new Option("(1.7) [0x1015] CAP_CUSTOMDSDATA", 0x1015)); break;
                case 0x1016: supportedCapabilities.options.add(new Option("(1.7) [0x1016] CAP_ENDORSER", 0x1016)); break;
                case 0x1017: supportedCapabilities.options.add(new Option("(1.7) [0x1017] CAP_JOBCONTROL", 0x1017)); break;
                case 0x1018: supportedCapabilities.options.add(new Option("(1.8) [0x1018] CAP_ALARMS", 0x1018)); break;
                case 0x1019: supportedCapabilities.options.add(new Option("(1.8) [0x1019] CAP_ALARMVOLUME", 0x1019)); break;
                case 0x101A: supportedCapabilities.options.add(new Option("(1.8) [0x101a] CAP_AUTOMATICCAPTURE", 0x101A)); break;
                case 0x101B: supportedCapabilities.options.add(new Option("(1.8) [0x101b] CAP_TIMEBEFOREFIRSTCAPTURE", 0x101B)); break;
                case 0x101C: supportedCapabilities.options.add(new Option("(1.8) [0x101c] CAP_TIMEBETWEENCAPTURES", 0x101C)); break;
                case 0x101D: supportedCapabilities.options.add(new Option("(1.8) [0x101d] CAP_CLEARBUFFERS", 0x101D)); break;
                case 0x101E: supportedCapabilities.options.add(new Option("(1.8) [0x101e] CAP_MAXBATCHBUFFERS", 0x101E)); break;
                case 0x101F: supportedCapabilities.options.add(new Option("(1.8) [0x101f] CAP_DEVICETIMEDATE", 0x101F)); break;
                case 0x1020: supportedCapabilities.options.add(new Option("(1.8) [0x1020] CAP_POWERSUPPLY", 0x1020)); break;
                case 0x1021: supportedCapabilities.options.add(new Option("(1.8) [0x1021] CAP_CAMERAPREVIEWUI", 0x1021)); break;
                case 0x1022: supportedCapabilities.options.add(new Option("(1.8) [0x1022] CAP_DEVICEEVENT", 0x1022)); break;
                case 0x1022: supportedCapabilities.options.add(new Option("(1.8) [0x1023] CAP_PAGEMULTIPLEACQUIRE", 0x1023)); break;
                case 0x1024: supportedCapabilities.options.add(new Option("(1.8) [0x1024] CAP_SERIALNUMBER", 0x1024)); break;
                //0x1025 not found in spec
                case 0x1026: supportedCapabilities.options.add(new Option("(1.8) [0x1026] CAP_PRINTER", 0x1026)); break;
                case 0x1027: supportedCapabilities.options.add(new Option("(1.8) [0x1027] CAP_PRINTERENABLED", 0x1027)); break;
                case 0x1028: supportedCapabilities.options.add(new Option("(1.8) [0x1028] CAP_PRINTERINDEX", 0x1028)); break;
                case 0x1029: supportedCapabilities.options.add(new Option("(1.8) [0x1029] CAP_PRINTERMODE", 0x1029)); break;
                case 0x102A: supportedCapabilities.options.add(new Option("(1.8) [0x102a] CAP_PRINTERSTRING", 0x102A)); break;
                case 0x102B: supportedCapabilities.options.add(new Option("(1.8) [0x102b] CAP_PRINTERSUFFIX", 0x102B)); break;
                case 0x102C: supportedCapabilities.options.add(new Option("(1.8) [0x102c] CAP_LANGUAGE", 0x102C)); break;
                case 0x102D: supportedCapabilities.options.add(new Option("(1.8) [0x102d] CAP_FEEDERALIGNMENT", 0x102D)); break;
                case 0x102E: supportedCapabilities.options.add(new Option("(1.8) [0x102e] CAP_FEEDERORDER", 0x102E)); break;
                case 0x102E: supportedCapabilities.options.add(new Option("(1.8) [0x102f] CAP_PAPERBINDING", 0x102F)); break;
                case 0x1030: supportedCapabilities.options.add(new Option("(1.8) [0x1030] CAP_REACQUIREALLOWED", 0x1030)); break;
                case 0x1030: supportedCapabilities.options.add(new Option("(1.8) [0x1031] CAP_PASSTHRU", 0x1031)); break;
                case 0x1032: supportedCapabilities.options.add(new Option("(1.8) [0x1032] CAP_BATTERYMINUTES", 0x1032)); break;
                case 0x1033: supportedCapabilities.options.add(new Option("(1.8) [0x1033] CAP_BATTERYPERCENTAGE", 0x1033)); break;

                case 0x1034: supportedCapabilities.options.add(new Option("(1.91) [0x1034] CAP_CAMERASIDE", 0x1034)); break;
                case 0x1035: supportedCapabilities.options.add(new Option("(1.91) [0x1035] CAP_SEGMENTED", 0x1035)); break;

                case 0x1036: supportedCapabilities.options.add(new Option("(2.0) [0x1036] CAP_CAMERAENABLED", 0x1036)); break;
                case 0x1037: supportedCapabilities.options.add(new Option("(2.0) [0x1037] CAP_CAMERAORDER", 0x1037)); break;
                case 0x1038: supportedCapabilities.options.add(new Option("(2.0) [0x1038] CAP_MICRENABLED", 0x1038)); break;
                case 0x1039: supportedCapabilities.options.add(new Option("(2.0) [0x1039] CAP_FEEDERPREP", 0x1039)); break;
                case 0x103A: supportedCapabilities.options.add(new Option("(2.0) [0x103a] CAP_FEEDERPOCKET", 0x103A)); break;

                case 0x103B: supportedCapabilities.options.add(new Option("(2.1) [0x103b] CAP_AUTOMATICSENSEMEDIUM", 0x103B)); break;
                case 0x103C: supportedCapabilities.options.add(new Option("(2.1) [0x103c] CAP_CUSTOMINTERFACEGUID", 0x103C)); break;

                case 0x103D: supportedCapabilities.options.add(new Option("(2.2) [0x103d] CAP_SUPPORTEDCAPSSEGMENTUNIQUE", 0x103D)); break;
                case 0x103E: supportedCapabilities.options.add(new Option("(2.2) [0x103e] CAP_SUPPORTEDDATS", 0x103E)); break;
                case 0x103F: supportedCapabilities.options.add(new Option("(2.2) [0x103f] CAP_DOUBLEFEEDDETECTION", 0x103F)); break;
                case 0x1040: supportedCapabilities.options.add(new Option("(2.2) [0x1040] CAP_DOUBLEFEEDDETECTIONLENGTH", 0x1040)); break;
                case 0x1041: supportedCapabilities.options.add(new Option("(2.2) [0x1041] CAP_DOUBLEFEEDDETECTIONSENSITIVITY", 0x1041)); break;
                case 0x1042: supportedCapabilities.options.add(new Option("(2.2) [0x1042] CAP_DOUBLEFEEDDETECTIONRESPONSE", 0x1042)); break;
                case 0x1043: supportedCapabilities.options.add(new Option("(2.2) [0x1043] CAP_PAPERHANDLING", 0x1043)); break;
                case 0x1044: supportedCapabilities.options.add(new Option("(2.2) [0x1044] CAP_INDICATORSMODE", 0x1044)); break;
                case 0x1045: supportedCapabilities.options.add(new Option("(2.2) [0x1045] CAP_PRINTERVERTICALOFFSET", 0x1045)); break;

                case 0x1046: supportedCapabilities.options.add(new Option("(1.8) [0x1046] CAP_POWERSAVETIME", 0x1046)); break;

                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x1047] CAP_PRINTERCHARROTATION", 0x1047)); break;
                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x1048] CAP_PRINTERFONTSTYLE", 0x1048)); break;
                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x1049] CAP_PRINTERINDEXLEADCHAR", 0x1049)); break;
                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x104a] CAP_PRINTERINDEXMAXVALUE", 0x104A)); break;
                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x104b] CAP_PRINTERINDEXNUMDIGITS", 0x104B)); break;
                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x104c] CAP_PRINTERINDEXSTEP", 0x104C)); break;
                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x104d] CAP_PRINTERINDEXTRIGGER", 0x104D)); break;
                case 0x1046: supportedCapabilities.options.add(new Option("(2.3) [0x104e] CAP_PRINTERSTRINGPREVIEW", 0x104E)); break;

                case 0x1046: supportedCapabilities.options.add(new Option("(2.4) [0x104f] CAP_SHEETCOUNT", 0x104F)); break;

                case 0x1100: supportedCapabilities.options.add(new Option("(1.0) [0x1100] ICAP_AUTOBRIGHT", 0x1100)); break;
                case 0x1101: supportedCapabilities.options.add(new Option("(1.0) [0x1101] ICAP_BRIGHTNESS", 0x1101)); break;
                //0x1102 not found
                case 0x1103: supportedCapabilities.options.add(new Option("(1.0) [0x1103] ICAP_CONTRAST", 0x1103)); break;
                case 0x1104: supportedCapabilities.options.add(new Option("(1.0) [0x1104] ICAP_CUSTHALFTONE", 0x1104)); break;
                case 0x1105: supportedCapabilities.options.add(new Option("(1.0) [0x1105] ICAP_EXPOSURETIME", 0x1105)); break;
                case 0x1106: supportedCapabilities.options.add(new Option("(1.0) [0x1106] ICAP_FILTER", 0x1106)); break;
                case 0x1107: supportedCapabilities.options.add(new Option("(1.0) [0x1107] ICAP_FLASHUSED", 0x1107)); break;
                case 0x1108: supportedCapabilities.options.add(new Option("(1.0) [0x1108] ICAP_GAMMA", 0x1108)); break;
                case 0x1109: supportedCapabilities.options.add(new Option("(1.0) [0x1109] ICAP_HALFTONES", 0x1109)); break;
                case 0x110A: supportedCapabilities.options.add(new Option("(1.0) [0x110a] ICAP_HIGHLIGHT", 0x110A)); break;
                //0x110b not found
                case 0x110C: supportedCapabilities.options.add(new Option("(1.0) [0x110c] ICAP_IMAGEFILEFORMAT", 0x110C)); break;
                case 0x110D: supportedCapabilities.options.add(new Option("(1.0) [0x110f] ICAP_LAMPSTATE", 0x110D)); break;
                case 0x110E: supportedCapabilities.options.add(new Option("(1.0) [0x110e] ICAP_LIGHTSOURCE", 0x110E)); break;
                //0x110F not found
                case 0x1110: supportedCapabilities.options.add(new Option("(1.0) [0x1110] ICAP_ORIENTATION", 0x1110)); break;
                case 0x1111: supportedCapabilities.options.add(new Option("(1.0) [0x1111] ICAP_PHYSICALWIDTH", 0x1111)); break;
                case 0x1112: supportedCapabilities.options.add(new Option("(1.0) [0x1112] ICAP_PHYSICALHEIGHT", 0x1112)); break;
                case 0x1113: supportedCapabilities.options.add(new Option("(1.0) [0x1113] ICAP_SHADOW", 0x1113)); break;
                case 0x1114: supportedCapabilities.options.add(new Option("(1.0) [0x1114] ICAP_FRAMES", 0x1114)); break;
                //0x1115 not found
                case 0x1116: supportedCapabilities.options.add(new Option("(1.0) [0x1116] ICAP_XNATIVERESOLUTION", 0x1116)); break;
                case 0x1117: supportedCapabilities.options.add(new Option("(1.0) [0x1117] ICAP_YNATIVERESOLUTION", 0x1117)); break;
                case 0x1118: supportedCapabilities.options.add(new Option("(1.0) [0x1118] ICAP_XRESOLUTION", 0x1118)); break;
                case 0x1119: supportedCapabilities.options.add(new Option("(1.0) [0x1119] ICAP_YRESOLUTION", 0x1119)); break;
                case 0x111A: supportedCapabilities.options.add(new Option("(1.0) [0x111a] ICAP_MAXFRAMES", 0x111A)); break;
                case 0x111B: supportedCapabilities.options.add(new Option("(1.0) [0x111b] ICAP_TILES", 0x111B)); break;
                case 0x111C: supportedCapabilities.options.add(new Option("(1.0) [0x111c] ICAP_BITORDER", 0x111C)); break;
                case 0x111D: supportedCapabilities.options.add(new Option("(1.0) [0x111d] ICAP_CCITTKFACTOR", 0x111D)); break;
                case 0x111E: supportedCapabilities.options.add(new Option("(1.0) [0x111e] ICAP_LIGHTPATH", 0x111E)); break;
                case 0x111F: supportedCapabilities.options.add(new Option("(1.0) [0x111f] ICAP_PIXELFLAVOR", 0x111F)); break;
                case 0x1120: supportedCapabilities.options.add(new Option("(1.0) [0x1120] ICAP_PLANARCHUNKY", 0x1120)); break;
                case 0x1121: supportedCapabilities.options.add(new Option("(1.0) [0x1121] ICAP_ROTATION", 0x1121)); break;
                case 0x1122: supportedCapabilities.options.add(new Option("(1.0) [0x1122] ICAP_SUPPORTEDSIZES", 0x1122)); break;
                case 0x1123: supportedCapabilities.options.add(new Option("(1.0) [0x1123] ICAP_THRESHOLD", 0x1123)); break;
                case 0x1124: supportedCapabilities.options.add(new Option("(1.0) [0x1124] ICAP_XSCALING", 0x1124)); break;
                case 0x1125: supportedCapabilities.options.add(new Option("(1.0) [0x1125] ICAP_YSCALING", 0x1125)); break;
                case 0x1126: supportedCapabilities.options.add(new Option("(1.0) [0x1126] ICAP_BITORDERCODES", 0x1126)); break;
                case 0x1127: supportedCapabilities.options.add(new Option("(1.0) [0x1127] ICAP_PIXELFLAVORCODES", 0x1127)); break;
                case 0x1128: supportedCapabilities.options.add(new Option("(1.0) [0x1128] ICAP_JPEGPIXELTYPE", 0x1128)); break;
                //0x1129 not found
                case 0x112A: supportedCapabilities.options.add(new Option("(1.0) [0x112a] ICAP_TIMEFILL", 0x112A)); break;
                case 0x112B: supportedCapabilities.options.add(new Option("(1.0) [0x112b] ICAP_BITDEPTH", 0x112B)); break;

                case 0x112C: supportedCapabilities.options.add(new Option("(1.5) [0x112c] ICAP_BITDEPTHREDUCTION", 0x112C)); break;

                case 0x112D: supportedCapabilities.options.add(new Option("(1.6) [0x112d] ICAP_UNDEFINEDIMAGESIZE", 0x112D)); break;

                case 0x112E: supportedCapabilities.options.add(new Option("(1.7) [0x112e] ICAP_IMAGEDATASET", 0x112E)); break;
                case 0x112F: supportedCapabilities.options.add(new Option("(1.7) [0x112f] ICAP_EXTIMAGEINFO", 0x112F)); break;
                case 0x1130: supportedCapabilities.options.add(new Option("(1.7) [0x1130] ICAP_MINIMUMHEIGHT", 0x1130)); break;
                case 0x1131: supportedCapabilities.options.add(new Option("(1.7) [0x1131] ICAP_MINIMUMWIDTH", 0x1131)); break;
                //0x1132, 1133 not found
                case 0x1134: supportedCapabilities.options.add(new Option("(2.0) [0x1134] ICAP_AUTODISCARDBLANKPAGES", 0x1134)); break;
                //0x1134 not found
                case 0x1136: supportedCapabilities.options.add(new Option("(1.8) [0x1136] ICAP_FLIPROTATION", 0x1136)); break;
                case 0x1137: supportedCapabilities.options.add(new Option("(1.8) [0x1137] ICAP_BARCODEDETECTIONENABLED", 0x1137)); break;
                case 0x1138: supportedCapabilities.options.add(new Option("(1.8) [0x1138] ICAP_SUPPORTEDBARCODETYPES", 0x1138)); break;
                case 0x1139: supportedCapabilities.options.add(new Option("(1.8) [0x1139] ICAP_BARCODEMAXSEARCHPRIORITIES", 0x1139)); break;
                case 0x113A: supportedCapabilities.options.add(new Option("(1.8) [0x113a] ICAP_BARCODESEARCHPRIORITIES", 0x113A)); break;
                case 0x113B: supportedCapabilities.options.add(new Option("(1.8) [0x113b] ICAP_BARCODESEARCHMODE", 0x113B)); break;
                case 0x113C: supportedCapabilities.options.add(new Option("(1.8) [0x113c] ICAP_BARCODEMAXRETRIES", 0x113C)); break;
                case 0x113D: supportedCapabilities.options.add(new Option("(1.8) [0x113d] ICAP_BARCODETIMEOUT", 0x113D)); break;
                case 0x113E: supportedCapabilities.options.add(new Option("(1.8) [0x113e] ICAP_ZOOMFACTOR", 0x113E)); break;
                case 0x113F: supportedCapabilities.options.add(new Option("(1.8) [0x113f] ICAP_PATCHCODEDETECTIONENABLED", 0x113F)); break;
                case 0x1140: supportedCapabilities.options.add(new Option("(1.8) [0x1140] ICAP_SUPPORTEDPATCHCODETYPES", 0x1140)); break;
                case 0x1141: supportedCapabilities.options.add(new Option("(1.8) [0x1141] ICAP_PATCHCODEMAXSEARCHPRIORITIES", 0x1141)); break;
                case 0x1142: supportedCapabilities.options.add(new Option("(1.8) [0x1142] ICAP_PATCHCODESEARCHPRIORITIES", 0x1142)); break;
                case 0x1143: supportedCapabilities.options.add(new Option("(1.8) [0x1143] ICAP_PATCHCODESEARCHMODE", 0x1143)); break;
                case 0x1144: supportedCapabilities.options.add(new Option("(1.8) [0x1144] ICAP_PATCHCODEMAXRETRIES", 0x1144)); break;
                case 0x1145: supportedCapabilities.options.add(new Option("(1.8) [0x1145] ICAP_PATCHCODETIMEOUT", 0x1145)); break;
                case 0x1146: supportedCapabilities.options.add(new Option("(1.8) [0x1146] ICAP_FLASHUSED2", 0x1146)); break;
                case 0x1147: supportedCapabilities.options.add(new Option("(1.8) [0x1147] ICAP_IMAGEFILTER", 0x1147)); break;
                case 0x1148: supportedCapabilities.options.add(new Option("(1.8) [0x1148] ICAP_NOISEFILTER", 0x1148)); break;
                case 0x1149: supportedCapabilities.options.add(new Option("(1.8) [0x1149] ICAP_OVERSCAN", 0x1149)); break;
                case 0x1150: supportedCapabilities.options.add(new Option("(1.8) [0x1150] ICAP_AUTOMATICBORDERDETECTION", 0x1150)); break;
                case 0x1151: supportedCapabilities.options.add(new Option("(1.8) [0x1151] ICAP_AUTOMATICDESKEW", 0x1151)); break;
                case 0x1152: supportedCapabilities.options.add(new Option("(1.8) [0x1152] ICAP_AUTOMATICROTATE", 0x1152)); break;

                case 0x1153: supportedCapabilities.options.add(new Option("(1.9) [0x1153] ICAP_JPEGQUALITY", 0x1153)); break;

                case 0x1154: supportedCapabilities.options.add(new Option("(1.91) [0x1154] ICAP_FEEDERTYPE", 0x1154)); break;
                case 0x1155: supportedCapabilities.options.add(new Option("(1.91) [0x1155] ICAP_ICCPROFILE", 0x1155)); break;

                case 0x1156: supportedCapabilities.options.add(new Option("(2.0) [0x1156] ICAP_AUTOSIZE", 0x1156)); break;

                case 0x1157: supportedCapabilities.options.add(new Option("(2.1) [0x1157] ICAP_AUTOMATICCROPUSESFRAME", 0x1157)); break;
                case 0x1158: supportedCapabilities.options.add(new Option("(2.1) [0x1158] ICAP_AUTOMATICLENGTHDETECTION", 0x1158)); break;
                case 0x1159: supportedCapabilities.options.add(new Option("(2.1) [0x1159] ICAP_AUTOMATICCOLORENABLED", 0x1159)); break;
                case 0x115A: supportedCapabilities.options.add(new Option("(2.1) [0x115a] ICAP_AUTOMATICCOLORNONCOLORPIXELTYPE", 0x115A)); break;
                case 0x115B: supportedCapabilities.options.add(new Option("(2.1) [0x115b] ICAP_COLORMANAGEMENTENABLED", 0x115B)); break;
                case 0x115C: supportedCapabilities.options.add(new Option("(2.1) [0x115c] ICAP_IMAGEMERGE", 0x115C)); break;
                case 0x115D: supportedCapabilities.options.add(new Option("(2.1) [0x115d] ICAP_IMAGEMERGEHEIGHTTHRESHOLD", 0x115D)); break;
                case 0x115E: supportedCapabilities.options.add(new Option("(2.1) [0x115e] ICAP_SUPPORTEDEXTIMAGEINFO", 0x115E)); break;

                case 0x115F: supportedCapabilities.options.add(new Option("(2.2) [0x115f] ICAP_FILMTYPE", 0x115F)); break;
                case 0x1160: supportedCapabilities.options.add(new Option("(2.2) [0x1160] ICAP_MIRROR", 0x1160)); break;
                case 0x1161: supportedCapabilities.options.add(new Option("(2.2) [0x1161] ICAP_JPEGSUBSAMPLING", 0x1161)); break;

                case 0x1202: supportedCapabilities.options.add(new Option("(1.8) [0x1202] ACAP_XFERMECH", 0x1202)); break;
                default: supportedCapabilities.options.add(new Option("(*.*) [0x" + capHexValue.toString(16) + "] Custom CAP", capHexValue));
            }
        }
    }
    supportedCapabilities.options.selectedIndex = 0;
}

function getCapabilityInfo() {
    var i;
    msgType.selectedIndex = 1;
    changeByMesageType();
    clearInfo();
    if (DWObject.DataSourceStatus != 1) {
        DWObject.SelectSourceByIndex(document.getElementById('source').value);
        DWObject.SetOpenSourceTimeout(2000);
        DWObject.OpenSource();
    }
    DWObject.Capability = parseInt(supportedCapabilities.value);
    DWObject.CapGet();
    txtReturnedOrToSet.value = DWObject.ErrorString;
    DynamsoftCapabilityNegotiation.tmpType = DWObject.CapType;
    ctnType.selectedIndex = 5;
    if (DynamsoftCapabilityNegotiation.tmpType > 2 && DynamsoftCapabilityNegotiation.tmpType < 7)
        ctnType.selectedIndex = DynamsoftCapabilityNegotiation.tmpType - 2;
    document.getElementById('availableValuesSPAN').style.display = 'none';
    DynamsoftCapabilityNegotiation.CurrentCapabilityHasBoolValue = false;
    switch (DynamsoftCapabilityNegotiation.tmpType) {
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_ARRAY/*3*/:
            document.getElementById('availableValuesSPAN').style.display = '';
            document.getElementById('availableValues').options.length = 1;
            for (i = 0; i < DWObject.CapNumItems; i++) {
                if (DWObject.CapValueType > 8) /* >8 is string*/
                /*STR*/document.getElementById('availableValues').options.add(new Option(DWObject.GetCapItemsString(i), DWObject.GetCapItemsString(i)));
                else
                /*NUM*/document.getElementById('availableValues').options.add(new Option(DWObject.GetCapItems(i), DWObject.GetCapItems(i)));
            }
            document.getElementById('availableValues').options.selectedIndex = 0;
            break;
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_ENUMERATION/*4*/:
            document.getElementById('availableValuesSPAN').style.display = '';
            document.getElementById('availableValues').options.length = 1;
            if (parseInt(supportedCapabilities.value) == Dynamsoft.DWT.EnumDWT_Cap.ICAP_FRAMES) {
                UpdateInfo('Special Capability ' + '- ICAP_FRAMES');
                for (i = 0; i < DWObject.CapNumItems; i++) {
                    DynamsoftCapabilityNegotiation.tempFrame = DWObject.CapGetFrameLeft(i) + " " + DWObject.CapGetFrameTop(i) + " " + DWObject.CapGetFrameRight(i) + " " + DWObject.CapGetFrameBottom(i);
                    document.getElementById('availableValues').options.add(new Option(DynamsoftCapabilityNegotiation.tempFrame, DynamsoftCapabilityNegotiation.tempFrame));
                }
                document.getElementById('availableValues').options.selectedIndex = 0;
            }
            else {
                for (i = 0; i < DWObject.CapNumItems; i++) {
                    if (DWObject.CapValueType > 8)
                    /*STR*/document.getElementById('availableValues').options.add(new Option(DWObject.GetCapItemsString(i), DWObject.GetCapItemsString(i)));
                    else
                    /*NUM*/document.getElementById('availableValues').options.add(new Option(DWObject.GetCapItems(i), DWObject.GetCapItems(i)));
                }
                _showMeaningfulInfo(supportedCapabilities.value);
                if (DWObject.CapValueType > 8) {
                    UpdateInfo('Current Index = ' + DWObject.CapCurrentIndex + ' (Value: ' + DWObject.GetCapItemsString(DWObject.CapCurrentIndex) + ')', true);
                    UpdateInfo('Default Index = ' + DWObject.CapDefaultIndex + ' (Value: ' + DWObject.GetCapItemsString(DWObject.CapDefaultIndex) + ')', true);
                }
                else {
                    UpdateInfo('Current Index = ' + DWObject.CapCurrentIndex + ' (Value: ' + DWObject.GetCapItems(DWObject.CapCurrentIndex) + ')', true);
                    UpdateInfo('Default Index = ' + DWObject.CapDefaultIndex + ' (Value: ' + DWObject.GetCapItems(DWObject.CapDefaultIndex) + ')', true);
                }
            }
            break;
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_ONEVALUE/*5*/:
            var tempValue = '';
            if (parseInt(supportedCapabilities.value) == Dynamsoft.DWT.EnumDWT_Cap.ICAP_FRAMES) {
                UpdateInfo('Special Capability ' + '- ICAP_FRAMES', true);
                DynamsoftCapabilityNegotiation.tempFrame = DWObject.CapGetFrameLeft(0) + " " + DWObject.CapGetFrameTop(0) + " " + DWObject.CapGetFrameRight(0) + " " + DWObject.CapGetFrameBottom(0);
                UpdateInfo('There is only one available Frame: ', false);
                UpdateInfo(DynamsoftCapabilityNegotiation.tempFrame, true);
            }
            else {
                if (DWObject.CapValueType > 8)
                /*STR*/tempValue = DWObject.CapValueString;
                else
                /*NUM*/tempValue = DWObject.CapValue;
                /*
				* Special for BOOL
				*/
                if (DWObject.CapValueType == Dynamsoft.DWT.EnumDWT_CapValueType.TWTY_BOOL) {
                    DynamsoftCapabilityNegotiation.CurrentCapabilityHasBoolValue = true;
                    if (tempValue == 0) tempValue = 'FALSE'; else tempValue = 'TRUE';
                }
                /*
				* Special for DUPLEX
				*/
                if (parseInt(supportedCapabilities.value) == Dynamsoft.DWT.EnumDWT_Cap.CAP_DUPLEX) tempValue = STR_DuplexValue[tempValue];
                UpdateInfo('ItemType = ' + STR_CapValueType[DWObject.CapValueType], true);
                UpdateInfo('Value = ' + tempValue, true);
            }
            break;
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_RANGE/*6*/:
            UpdateInfo('ItemType = ' + STR_CapValueType[DWObject.CapValueType], true);
            UpdateInfo('Min = ' + DWObject.CapMinValue, true);
            UpdateInfo('Max = ' + DWObject.CapMaxValue, true);
            UpdateInfo('StepSize = ' + DWObject.CapStepSize, true);
            UpdateInfo('Default = ' + DWObject.CapDefaultValue, true);
            UpdateInfo('Current = ' + DWObject.CapCurrentValue, true);
            break;
        default: console.log('This Capability is not supported');
    }
    var supportLevel = [];
    if (DWObject.CapIfSupported(Dynamsoft.DWT.EnumDWT_MessageType.TWQC_GET)) supportLevel.push('GET');/*TWQC_GET*/
    if (DWObject.CapIfSupported(Dynamsoft.DWT.EnumDWT_MessageType.TWQC_SET)) supportLevel.push('SET');/*TWQC_SET*/
    if (DWObject.CapIfSupported(Dynamsoft.DWT.EnumDWT_MessageType.TWQC_RESET)) supportLevel.push('RESET');/*TWQC_RESET*/
    if (supportLevel.length > 0) {
        UpdateInfo('Supported operations: ', false);
        UpdateInfo(supportLevel.join(' / '), true);
    }
}

function setCapability() {
    var tempValue = '', i, valueToShow;
    clearInfo();
    if (DWObject.DataSourceStatus != 1) {
        DWObject.SelectSourceByIndex(document.getElementById('source').value);
        DWObject.SetOpenSourceTimeout(2000);
        DWObject.OpenSource();
    }
    DWObject.Capability = parseInt(supportedCapabilities.value);
    DWObject.CapGet();
    DynamsoftCapabilityNegotiation.tmpType = DWObject.CapType;
    ctnType.selectedIndex = 5;
    if (DynamsoftCapabilityNegotiation.tmpType > 2 && DynamsoftCapabilityNegotiation.tmpType < 7)
        ctnType.selectedIndex = DynamsoftCapabilityNegotiation.tmpType - 2;
    switch (DynamsoftCapabilityNegotiation.tmpType) {
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_ARRAY/*3*/:
            alert('Setting an Array is not implemented');
            break;
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_ENUMERATION/*4*/:
            if (parseInt(supportedCapabilities.value) == Dynamsoft.DWT.EnumDWT_Cap.ICAP_FRAMES) {
                if (document.getElementById('availableValues').length == 1) { /*Nothing in the List*/
                    tempValue = txtReturnedOrToSet.value.split(' ');
                }
                else {
                    tempValue = document.getElementById('availableValues').value.split(' ');
                }
                if (txtReturnedOrToSet.value != DynamsoftCapabilityNegotiation.tempFrame) {
                    tempValue = txtReturnedOrToSet.value.split(' ');
                }
                DWObject.CapSetFrame(document.getElementById('availableValues').selectedIndex, parseFloat(tempValue[0]), parseFloat(tempValue[1]), parseFloat(tempValue[2]), parseFloat(tempValue[3]));
                DWObject.CapCurrentIndex = document.getElementById('availableValues').selectedIndex - 1;
                DWObject.CapSet();
                UpdateInfo(DWObject.ErrorString, true);
                for (i = 0; i < DWObject.CapNumItems; i++) {
                    DynamsoftCapabilityNegotiation.tempFrame = DWObject.CapGetFrameLeft(i) + " " + DWObject.CapGetFrameTop(i) + " " + DWObject.CapGetFrameRight(i) + " " + DWObject.CapGetFrameBottom(i);
                    UpdateInfo("Current Frame is: " + DynamsoftCapabilityNegotiation.tempFrame);
                }
            }
            else {
                DWObject.CapValue = document.getElementById('availableValues')[document.getElementById('availableValues').selectedIndex].value;
                DWObject.CapCurrentIndex = document.getElementById('availableValues').selectedIndex - 1;
                DWObject.CapSet();
                UpdateInfo(DWObject.ErrorString, true);
                DWObject.CapGet();
                UpdateInfo('After Setting:');
                if (DWObject.CapValueType > 8) {
                    UpdateInfo('Current Index = ' + DWObject.CapCurrentIndex + ' (Value: ' + DWObject.GetCapItemsString(DWObject.CapCurrentIndex) + ')', true);
                    UpdateInfo('Default Index = ' + DWObject.CapDefaultIndex + ' (Value: ' + DWObject.GetCapItemsString(DWObject.CapDefaultIndex) + ')', true);
                }
                else {
                    UpdateInfo('Current Index = ' + DWObject.CapCurrentIndex + ' (Value: ' + DWObject.GetCapItems(DWObject.CapCurrentIndex) + ')', true);
                    UpdateInfo('Default Index = ' + DWObject.CapDefaultIndex + ' (Value: ' + DWObject.GetCapItems(DWObject.CapDefaultIndex) + ')', true);
                }
            }
            break;
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_ONEVALUE/*5*/:
            if (parseInt(supportedCapabilities.value) == Dynamsoft.DWT.EnumDWT_Cap.ICAP_FRAMES) {
                tempValue = txtReturnedOrToSet.value.split(' ');
                DWObject.CapSetFrame(0, parseFloat(tempValue[0]), parseFloat(tempValue[1]), parseFloat(tempValue[2]), parseFloat(tempValue[3]));
                DWObject.CapSet();
                UpdateInfo(DWObject.ErrorString, true);
                for (i = 0; i < DWObject.CapNumItems; i++) {
                    DynamsoftCapabilityNegotiation.tempFrame = DWObject.CapGetFrameLeft(i) + " " + DWObject.CapGetFrameTop(i) + " " + DWObject.CapGetFrameRight(i) + " " + DWObject.CapGetFrameBottom(i);
                    UpdateInfo("Current Frame is: " + DynamsoftCapabilityNegotiation.tempFrame);
                }
            }
            else {
                if (DynamsoftCapabilityNegotiation.CurrentCapabilityHasBoolValue) {
                    DWObject.CapValue = TrueOrFalse.value;
                }
                else {
                    if (DWObject.CapValueType > 8)
                    /*STR*/DWObject.CapValue = txtReturnedOrToSet.value;
                    else
                    /*NUM*/DWObject.CapValue = parseFloat(txtReturnedOrToSet.value);
                }
                DWObject.CapSet();
                UpdateInfo(DWObject.ErrorString, true);
                DWObject.CapGet();
                valueToShow = DWObject.CapValue;
                if (DWObject.CapValueType == Dynamsoft.DWT.EnumDWT_CapValueType.TWTY_BOOL) {
                    if (valueToShow == 0) valueToShow = 'FALSE'; else valueToShow = 'TRUE';
                }
                UpdateInfo('Value after setting: ' + valueToShow, true);
            }
            break;
        case Dynamsoft.DWT.EnumDWT_CapType.TWON_RANGE/*6*/:
            DWObject.CapCurrentValue = parseFloat(txtReturnedOrToSet.value);
            DWObject.CapSet();
            UpdateInfo(DWObject.ErrorString, true);
            DWObject.CapGet();
            valueToShow = DWObject.CapCurrentValue;
            UpdateInfo('Value after setting: ' + valueToShow, true);
            break;
        default: console.log('This Capability is not supported');
    }
}

function clearInfo() {
    document.getElementById('status_text').innerHTML = "";
    textStatus = "";
}

function UpdateInfo(txt, specialtxt) {
    if (specialtxt) {
        textStatus += '<span style="color:#cE5E04"><strong>' + txt + '</strong></span><br />';
    }
    else {
        textStatus += txt + "<br />";
    }
    document.getElementById('status_text').innerHTML = textStatus;
}

function changeByMesageType() {
    switch (parseInt(document.getElementById('messageType').value)) {
        case Dynamsoft.DWT.EnumDWT_MessageType.TWQC_GET:
            document.getElementById('btnSetCapability').style.display = 'none';
            txtReturnedOrToSet.placeholder = 'Returned Value';
            txtReturnedOrToSet.style.display = '';
            TrueOrFalse.style.display = 'none';
            document.getElementById('textAboveInput').innerText = 'Returned:';
            document.getElementById('textAboveInput').style.display = '';
            break;
        case Dynamsoft.DWT.EnumDWT_MessageType.TWQC_SET:
            document.getElementById('btnSetCapability').style.display = '';
            txtReturnedOrToSet.placeholder = 'Value to Set';
            txtReturnedOrToSet.value = '';
            if (DynamsoftCapabilityNegotiation.tmpType == Dynamsoft.DWT.EnumDWT_CapType.TWON_ENUMERATION) {
                document.getElementById('textAboveInput').style.display = 'none';
                txtReturnedOrToSet.style.display = 'none';
            }
            else {
                document.getElementById('textAboveInput').style.display = '';
                if (DynamsoftCapabilityNegotiation.CurrentCapabilityHasBoolValue) {
                    txtReturnedOrToSet.style.display = 'none';
                    TrueOrFalse.style.display = '';
                }
                else {
                    txtReturnedOrToSet.style.display = '';
                    TrueOrFalse.style.display = 'none';
                }
            }

            if (parseInt(supportedCapabilities.value) == Dynamsoft.DWT.EnumDWT_Cap.ICAP_FRAMES) {
                document.getElementById('textAboveInput').style.display = '';
                txtReturnedOrToSet.style.display = '';
                txtReturnedOrToSet.value = DynamsoftCapabilityNegotiation.tempFrame;
            }
            document.getElementById('textAboveInput').innerText = 'Set this Value:';
            break;
        case Dynamsoft.DWT.EnumDWT_MessageType.TWQC_RESET:
            clearInfo();
            if (DWObject.DataSourceStatus != 1) {
                DWObject.SetOpenSourceTimeout(2000);
                DWObject.OpenSource();
            }
            DWObject.Capability = parseInt(supportedCapabilities.value);
            DWObject.CapReset();
            UpdateInfo('Resetting ' + supportedCapabilities.options[supportedCapabilities.options.selectedIndex].innerText + ' in 1 second...', true);
            setTimeout(function () {
                getCapabilityInfo();
            }, 1000);
            break;
    }
}

/*For More Friendly UI*/

STR_CapValueType = [
    'TWTY_INT8', 'TWTY_INT16', 'TWTY_INT32', 'TWTY_UINT8', 'TWTY_UINT16', 'TWTY_int', 'TWTY_BOOL',
    'TWTY_FIX32', 'TWTY_FRAME', 'TWTY_STR32', 'TWTY_STR64', 'TWTY_STR128', 'TWTY_STR255'];

STR_PageSizes = [
    "Custom", "A4LETTER, A4", "B5LETTER, JISB5", "USLETTER", "USLEGAL", "A5", "B4, ISOB4", "B6, ISOB6", "Unknown Size",
    "USLEDGER", "USEXECUTIVE", "A3", "B3, ISOB3", "A6", "C4", "C5", "C6", "4A0", "2A0", "A0", "A1", "A2", "A7",
    "A8", "A9", "A10", "ISOB0", "ISOB1", "ISOB2", "ISOB5", "ISOB7", "ISOB8", "ISOB9", "ISOB10", "JISB0", "JISB1",
    "JISB2", "JISB3", "JISB4", "JISB6", "JISB7", "JISB8", "JISB9", "JISB10", "C0", "C1", "C2", "C3", "C7", "C8",
    "C9", "C10", "USEXECUTIVE", "BUSINESSCARD"];

STR_DuplexValue = ['TWDX_NONE(0)', 'TWDX_1PASSDUPLEX(1)', 'TWDX_2PASSDUPLEX(2)'];

STR_UnitType = ['INCHES(0)', 'CENTIMETERS(1)', 'PICAS(2)', 'POINTS(3)', 'TWIPS(4)', 'PIXELS(5)', 'MILLIMETERS(6)'];

STR_PixelType = ['TWPT_BW(0)', 'TWPT_GRAY(1)', 'TWPT_RGB(2)', 'TWPT_PALLETE(3)', 'TWPT_CMY(4)',
    'TWPT_CMYK(5)', 'TWPT_YUV(6)', 'TWPT_YUVK(7)', 'TWPT_CIEXYZ(8)', 'TWPT_LAB(9)', 'TWPT_SRGB(10)',
    'TWPT_SCRGB(11)', 'Unknown(12)', 'Unknown(13)', 'Unknown(14)', 'Unknown(15)', 'TWPT_INFRARED(16)'];

STR_UnitType = ['TWUN_INCHES(0)', 'TWUN_CENTIMETERS(1)', 'TWUN_PICAS(2)', 'TWUN_POINTS(3)',
    'TWUN_TWIPS(4)', 'TWUN_PIXELS(5)', 'TWUN_MILLIMETERS(6)'];

STR_XFERMECH = ['TWSX_NATIVE(0)', 'TWSX_FILE(1)', 'TWSX_MEMORY(2)', 'Unknown(3)', 'TWSX_MEMFILE(4)'];

STR_IMAGEFILEFORMAT = ['TWFF_TIFF(0)', 'TWFF_PICT(1)', 'TWFF_BMP(2)', 'TWFF_XBM(3)', 'TWFF_JFIF(4)',
    'TWFF_FPX(5)', 'TWFF_TIFFMULTI(6)', 'TWFF_PNG(7)', 'TWFF_SPIFF(8)', 'TWFF_EXIF(9)', 'TWFF_PDF(10)',
    'TWFF_JP2(11)', 'removed(12)', 'TWFF_JPX(13)', 'TWFF_DEJAVU(14)', 'TWFF_PDFA(15)', 'TWFF_PDFA2(16)'];

STR_ORIENTATION = ['TWOR_PORTRAIT', 'TWOR_ROT90', 'TWOR_ROT180', 'TWOR_LANDSCAPE', 'TWOR_AUTO',
    'TWOR_AUTOTEXT', 'TWOR_AUTOPICTURE'];

STR_PIXELFLAVOR = ['TWPF_CHOCOLATE(0)', 'TWPF_VANILLA(1)'];

function _showMeaningfulInfo(_cap) {
    var oSTR = [], bHasSTR = true;
    switch (parseInt(_cap)) {
        case 0x1122: oSTR = STR_PageSizes; break;
        case 0x0101: oSTR = STR_PixelType; break;
        case 0x0102: oSTR = STR_UnitType; break;
        case 0x0103: oSTR = STR_XFERMECH; break;
        case 0x110C: oSTR = STR_IMAGEFILEFORMAT; break;
        case 0x1110: oSTR = STR_ORIENTATION; break;
        case 0x111F: oSTR = STR_PIXELFLAVOR; break;
        default: bHasSTR = false; break;
    }
    if (bHasSTR) {
        for (var i = 1; i < document.getElementById('availableValues').options.length; i++) {
            document.getElementById('availableValues').options[i].text =
                oSTR[parseInt(document.getElementById('availableValues').options[i].value)];
        }
    }
}