var plugDJToolsExtensionUninstall = (function() {
  let resCancel = "Cancel";

  let resClearPlaylist = "Clear playlist";
  let resClearName = (name) => `Clear ${name}?`;
  let resTypeCodeToClear = (code) => `Type ${code} To Clear`;
  let resTypeCode = (code) => `Type ${code}`;

  let resDeleteMedia = "Delete media";
  let resDeleteItems = (count) => `Delete ${count} items from your playlist?`;
  let resDeleteItem = (author, title) => `Delete ${author} - ${title} from your playlist?`;

  let resGearPlaylist = "Generate playlist"
  let resGearName = (name) => `Generate ${name}?`;
  let resTypeTracksCountToGenerate = (total) => `Type the number of tracks to generate / ${total}`;
  let resTypeTracksCount = "#tracks";

  let resSortPlaylist = "Sort active playlist";
  let resSortName = (name) => `Are you sure you want to sort ${name}?`;

  let resMaxByArtist = "Max title by artist (empty = not limited)";
  let resTypeMaxByArtist = "#max artist";

  let resBeginning = "Add on top";
  let resEnd = "Append";
  let resOverwrite = "Overwrite playlist";

  let resOld = "Old";

  let resLogoTitles = ["None", "Japan", "Other", "Video game", "Indies", "Fiction", "Idols", "J-Music", "Retro Gaming", "Christmas", "Roleplay"];

  const logoTags = ["NLN", "NLJ", "NLO", "NLVG", "NLIN", "NLF", "NLID", "NLJM", "NLRG", "NLC", "NLRP"];
  const logoClasses = ["", "jm", "o", "vg", "in", "jm", "jm", "jm", "rg", "jm", "in"];

  const version = "1.5.3";
  const logoEdges = ["#55555566", "#FF6E6E66", "#AAAAAA66", "#96C2D066", "#FBE17066", "#C7A8CA66", "#FDBFFB66", "#FF6E6E66", "#A6C19E66", "#A6C19E66", "#96C2D066"];
  const logoLetters = ["#AAAAAAE6", "#FFFFFFE6", "#FFFFFFE6", "#498BC3E6", "#F2C10CE6", "#946BA8E6", "#FA92F9E6", "#F20A0EE6", "#698F5CE6", "#F20A0EE6", "#FFFFFFE6"];
  const logoOldN = [undefined, undefined, "#E8E8E8", "#7BB5DD", "#E5D3A3", "#C1B3C0", "#E8D3DC", "#E48889", "#8ACB87", undefined, undefined];
  const logoOldOLIFE = [undefined, undefined, "#919B93", "#1B84B4", "#D59C31", "#8B629C", "#E59CBA", "#A0191D", "#4C7451", undefined, undefined];

  const maxPlaylist = 200;

  const tsvColumnSeparator = "\t";
  const tsvRowTerminator = "\r\n";
  const tsvExportColumnsAdvanced = ["pl-name", "pl-id", "cid", "id", "author", "title", "duration", "format", "image"];
  const tsvExportColumnsNormal = ["pl-name", "cid", "author", "title", "duration", "format", "image"];

  const tsvTypeExportNormal = "normal";
  const tsvTypeExportAdvanced = "advanced";

  const tsvPasteNeedColumnsNormal = ["cid", "author", "title", "duration", "format"];
  const tsvPasteNeedColumnsAdvanced = ["id"];
  const tsvCopyColumns = tsvExportColumnsAdvanced;

  let tsvExportColumns;
let tsvImportNeedColumns;
let tsvImportColumns;
let tsvFileName;
  let tsvTypeExport;

  let observerMediaPanel;
  let observerPlaylistMenu;
  let observerApp;
  let observerDialogContainer;
  let observerCommunityInfo;

  let logoIndex = 0;
  let previousLogoIndex = logoIndex;
  let tempLogoIndex = undefined;

  let previousAvatarId = undefined;
  let tempAvatarId = undefined;

  let logoChanged = false;
  let skipAtTimer;
  let skipAtTime;
  let skipAtId;
  let skipAtLeave;
  let clipBoard = {
    id: null,
    cut: false,
    medias: []
  };

  let busyMediasCheckboxes = false;
  let scale = "";

  let panelNolifeTitle = "";
  let panelNolifeYear = "";
  let panelNolifeArtist = "";
  let panelNolifeLyricistsComposers = "";
  let panelNolifeLabels = "";
  let panelNolifeTop = false;
  let panelNolifeClassic;
  let panelNolifeRight;
  let panelNolifeStart;
  let panelNolifeDuration1;
  let panelNolifeEnd;
  let panelNolifeDuration2;

  let smilId;
  let requestAnimationFrame;

  function language_fr() {
    resCancel = "Annuler";

    resClearPlaylist = "Effacer";
    resClearName = (name) => `Effacer ${name} ?`;
    resTypeCodeToClear = (code) => `Tapez ${code} pour effacer`;
    resTypeCode = (code) => `Tapez ${code}`;

    resDeleteMedia = "Supprimer cet élément";
    resDeleteItems = (count) => `Supprimer ${count} élements de votre liste de lecture ?`;
    resDeleteItem = (author, title) => `Supprimer ${author} - ${title} de votre liste ?`;

    resGearPlaylist = "Générer"
    resGearName = (name) => `Générer ${name} ?`;
    resTypeTracksCountToGenerate = (total) => `Tapez le nombre de pistes à générer / ${total}`;
    resTypeTracksCount = "Nb pistes";

    resSortPlaylist = "Trier liste active"
    resSortName = (name) => `Êtes vous sûr(e) de vouloir trier ${name} ?`;

    resMaxByArtist = "Max titre par artiste (vide = non limité)";
    resTypeMaxByArtist = "Max artiste";

    resBeginning = "Ajouter au début";
    resEnd = "Ajouter à la fin";
    resOverwrite = "Ecraser la liste";

    resOld = "Ancien";

    resLogoTitles = ["Aucun", "Japon", "Autre", "Jeu vidéo", "Indies", "Fiction", "Idols", "J-Music", "Rétro Gaming", "Noël", "Jeu de rôle"];
  }

  function keydownDocument(event) {
    if (event.which == 13) {
      $("#dialog-media-update .button.submit").mousedown();
      $("#dialog-playlist-delete .button.submit").click();
    } else if (event.which == 27) {
      $("#dialog-playlist-delete .button.cancel").click();
      $("#dialog-confirm .button.cancel").click();
    }
  }

  function smil() {
    const panelNolife = document.getElementById("panel-nolife");
    if (panelNolife) {
      let stops = panelNolife.getElementsByTagName("stop");
      for (let stop of stops) {
        if (stop.hasAttribute("style")) {
          const opacity = document.defaultView.getComputedStyle(stop, null).getPropertyValue("opacity");
          stop.setAttribute("offset", opacity * 100 + "%");
        }
      }
    }
    const logoNolife = document.getElementById("logo-nolife");
    if (logoNolife) {
      let paths = logoNolife.getElementsByTagName("path");
      const scale = document.defaultView.getComputedStyle(paths[4], null).getPropertyValue("transform");
      if (scale != "none") {
        const p1 = scale.replace("matrix(", "").split(",")[0];
        const p2 = 1.0 - p1;
        paths[1].setAttribute("d", `M 85,185 L${757 * p1 + 85 * p2},${173 * p1 + 185 * p2} L${774 * p1 + 102 * p2},${215 * p1 + 227 * p2} L102,227 Z`);
      }
    }
    smilId = requestAnimationFrame(smil, 33);
  }

  function visibilityChange() {
    if (!document.hidden) {
    console.log("update");
      panelNolifeUpdate(API.getMedia());
    }
  }

  function createAll() {
    const language = API.getUser().language;
    if (language == "fr") {
      language_fr();
    }
    createCSS();
    createPlaylistsButtons();
    createPlaylistButtons();
    createPlaylistsCheckboxes();
    createMediasCheckboxes();
    createUserLogoBouncer();
    createObservers();
    API.on(API.ADVANCE, advance);
    $(document).on("keydown", keydownDocument);

    if (window.ApplePaySession) {
      requestAnimationFrame = window.setTimeout;
      cancelAnimationFrame = window.clearTimeout;
    } else {
      requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
      cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    }
    smilId = requestAnimationFrame(smil, 33);

  //if ((typeof InstallTrigger == "object") && (typeof document.hidden == "boolean")) {
      document.addEventListener("visibilitychange", visibilityChange, false);
  //}

    if (typeof navigator.clipboard.readText != "function") {
      let readTextResolve, readTextReject;
      window.addEventListener("message", async (event) => {
        if (event.source == window && event.data && event.data.textReaded) {
          console.log("textReaded", event.data.textReaded);
          readTextResolve(event.data.textReaded);
        }
      });

      navigator.clipboard.readText = function () {
        let promise = new Promise((resolve, reject) => {
          readTextResolve = resolve;
          readTextReject = reject;
        });
        window.postMessage({
          readText: true
        }, "*");
        return promise;
      }
    }

    loadAvatar();

  enterRoom(document.location.pathname.replace("/", ""));
  }

  function loadAvatar() {
    const plugdjtools = localStorage.getItem("plugdjtools");
    if (plugdjtools != null) {
      const settings = JSON.parse(plugdjtools);
      const setting = settings.find(setting => setting.id == API.getUser().id);
      if (setting != undefined) {
        tempAvatarId = setting.tempAvatarId;
        previousAvatarId = setting.previousAvatarId;
      }
    }
  }

  function saveAvatar() {
    const plugdjtools = localStorage.getItem("plugdjtools");
    let settings = [];
    if (plugdjtools != null) {
      settings = JSON.parse(plugdjtools);
      index = settings.findIndex(setting => setting.id == API.getUser().id);
      if (index >= 0) {
        settings.splice(index, 1);
      }
    }
    if ((tempAvatarId != undefined && previousAvatarId != undefined)) {
      settings.push({
        id: API.getUser().id,
        tempAvatarId: tempAvatarId,
        previousAvatarId: previousAvatarId
      });
    }
    if (settings.length > 0) {
      localStorage.setItem("plugdjtools", JSON.stringify(settings));
    } else {
      localStorage.removeItem("plugdjtools");
    }
  }

  function hasAvatarToRestore() {
    return (previousAvatarId != undefined) && (API.getUser().avatarID == tempAvatarId) && (API.getUser().avatarID != previousAvatarId);
  }

  function restoreAvatar() {
    if (hasAvatarToRestore()) {
      changeAvatar(previousAvatarId).then(json => {
        if (json.status == "ok") {
          previousAvatarId = undefined;
          tempAvatarId = undefined;
          saveAvatar();
        }
      });
    } else if ((previousAvatarId != undefined) || (tempAvatarId != undefined)) {
      previousAvatarId = undefined;
      tempAvatarId = undefined;
      saveAvatar();
    }
  }

  function createCSS() {
    if ($("#plugdj-tools-extension-css").length == 0) {
      const style = $('<style id="plugdj-tools-extension-css">.community__playlist--desktop { width: 350px !important; } .community .community__playing-top { background-color: black !important; } @keyframes fade {from { fill: #EEEEEE; } to { fill: transparent; }} #fullscreen-layer #yt-watermark svg { fill: transparent; animation-name: none; } #fullscreen-layer:hover #yt-watermark svg { fill: #EEEEEE; animation-fill-mode: forwards; animation-name: fade; animation-delay: 4s; animation-duration: 1s; } #fullscreen-layer #yt-watermark:hover svg { fill: #FFFFFF; animation-name: none; } #media-panel .row .item { position: relative; height: 55px; width: 30px; margin-right: 0px; cursor: pointer; } #media-panel .row .item.selected i { display: block; } #media-panel .row .item i { top: 17px; left: 5px; display: none; } #playlist-menu .container .item { position: relative; height: 48px; width: 30px; margin-right: 0px; cursor: pointer; } #playlist-menu .container .item.selected i { display: block; } #playlist-menu .container .item i { top: 17px; left: 5px; display: none; } #playlist-panel.playlist--override #playlist-menu .container .row { padding: 0 0 0 0; } #dialog-container #dialog-playlist-delete .dropdown.open #up { display: block; } #dialog-container #dialog-playlist-delete .dropdown #up { display: none; padding: 6px 10px; } #dialog-container #dialog-playlist-delete .dropdown.open #down { display: none; } #dialog-container #dialog-playlist-delete .dropdown #down { display: block; padding: 6px 10px; } @media (min-width: 1344px) and (min-height: 850px) { .community .community__playing-top { min-width: 824px; min-height: 464px; }} .playlist-buttons-content { flex-wrap: wrap; max-height: 50px; } .playlist-buttons-content .playlist-buttons-import-create, .playlist-buttons-content .playlist-buttons-import-export-tsv { margin-top: 4px; } .playlist-buttons-content .playlist-buttons-import-export-tsv { flex-grow: 1; display: flex; padding-right: 20px; justify-content: center; align-items: center; margin-top: 8px; } .playlist-buttons-content #playlist-import-tsv.button, .playlist-buttons-content #playlist-export-tsv.button { position: relative; bottom: auto; height: auto; width: 46%; margin: 0 2%; max-width: 120px; text-transform: uppercase; text-align: center; cursor: pointer; font-size: 12px; padding: 6px 15px; background: 0 0; border: 1px solid #fff; border-radius: 20px; display: flex; justify-content: center; align-items: center; opacity: .6; transition: all .3s; }  #playlist-import-tsv { left: 0; z-index: 50; background: #323742; } #playlist-export-tsv { right: 0; z-index: 55; background: #444a59; } .playlist-buttons-content #playlist-export-tsv.button:hover, .playlist-buttons-content #playlist-import-tsv.button:hover { opacity: 1; transition: all .3s; } .playlist-buttons-content #playlist-export-tsv.button i, .playlist-buttons-content #playlist-import-tsv.button i { top: auto; margin: 0 5px 0 0; font-size: 14px; } .playlist-buttons-content #playlist-create-tsv.button span, .playlist-buttons-content #playlist-import-tsv.button span { margin: 0; top: 0; } @media (min-width: 768px) { .playlist-buttons-content .playlist-buttons-import-export-tsv { padding-right: 0; }} @font-face { font-family: Nolife; src: url(data:font/woff;base64,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); font-weight: bold; } @font-face { font-family: NolifeArtistLyricistsComposers; src: url(data:font/woff;base64,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); } @font-face { font-family: NolifeTitle; src: url(data:font/woff;base64,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); font-style: italic; //font-weight: bold; } @font-face { font-family: NolifeArtist; src: url(data:font/woff;base64,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); font-weight: bold; } @font-face { font-family: NolifeClassic; src: url(data:font/woff;base64,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); font-weight: bold; } text, .unselectable { pointer-events: none; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } .panel-nolife .title-nolife { font-family: NolifeTitle; font-size: 30px; font-style: italic; font-weight: bold; letter-spacing: 0.25px; text-shadow: 2px 2px #AAA, 1px 1px #AAA; } .panel-nolife .artist-nolife { font-family: NolifeArtist; font-size: 30px; font-weight: bold; letter-spacing: 0.5px } .panel-nolife .back-nolife { fill: black; stroke: black; stroke-width: 5px; } .panel-nolife .front-nolife { fill: white; stroke: black; stroke-width: 0.5px; } g.big-panel-nolife text.year-nolife, g.big-panel-nolife text.labels-nolife { font-family: Nolife; } g.big-panel-nolife text.title-nolife { font-family: NolifeTitle; font-size: 48px; font-style: italic; letter-spacing: 1px; fill: white; } g.big-panel-nolife text.artist-nolife, g.big-panel-nolife text.lyricists-composers-nolife { font-family: NolifeArtistLyricistsComposers; } g.big-panel-nolife text.classic-nolife { font-family: NolifeClassic; font-weight: bold; font-size: 28px; fill: url(#classic-gradient); } g.big-panel-nolife text.lyricists-composers-nolife { font-size: 32px; } g.big-panel-nolife text.year-nolife, g.big-panel-nolife text.artist-nolife, g.big-panel-nolife text.lyricists-composers-nolife { fill: black; text-shadow: 0px 2px #FFF; } g.big-panel-nolife text.artist-nolife { font-size: 48px; } g.big-panel-nolife text.year-nolife { font-weight: bold; font-size: 48px; } g.big-panel-nolife text.labels-nolife { font-weight: bold; font-size: 42px; } svg.jm .stroke-nolife { stroke: #EDA1A6; } svg.jm .stroke2-nolife { stroke: #B2242B; } svg.jm circle.fill-nolife { fill: url(#red-radial-gradient); } svg.jm g.big-panel-nolife path.title-nolife { fill: url(#red-vertical-gradient); } svg.jm g.big-panel-nolife path.labels-nolife { fill: #EDA1A6; } svg.jm g.big-panel-nolife text.labels-nolife { fill: #B90A25; } svg.jm g.big-panel-nolife path.block-nolife { fill: #C81D22; } svg.jm g.big-panel-nolife path.top-nolife.block-nolife, svg.jm g.big-panel-nolife path.bottom-nolife.stroke-nolife { stroke: #E06E70; } svg.jm g.big-panel-nolife path.top-nolife.stroke-nolife, svg.jm g.big-panel-nolife path.bottom-nolife.block-nolife { stroke: #851411; } svg.jm g.big-panel-nolife path.classic-nolife { fill: url(#classic-red-vertical-gradient); } svg.in .stroke-nolife { stroke: #E4CB82; } svg.in .stroke2-nolife { stroke: #DBAF1A; } svg.in circle.fill-nolife { fill: url(#yellow-radial-gradient); } svg.in g.big-panel-nolife path.title-nolife { fill: url(#yellow-vertical-gradient); } svg.in g.big-panel-nolife path.labels-nolife { fill: #E4CB82; } svg.in g.big-panel-nolife text.labels-nolife { fill: #916F0B; } svg.in g.big-panel-nolife path.block-nolife { fill: #D59A0A; } svg.in g.big-panel-nolife path.top-nolife.block-nolife, svg.in g.big-panel-nolife path.bottom-nolife.stroke-nolife { stroke: #D6A926; } svg.in g.big-panel-nolife path.top-nolife.stroke-nolife, svg.in g.big-panel-nolife path.bottom-nolife.block-nolife { stroke: #9A6300; } svg.rg .stroke-nolife { stroke: #A0E893; } svg.rg .stroke2-nolife { stroke: #626850; } svg.rg .fill-nolife { fill: url(#green-radial-gradient); } svg.rg g.big-panel-nolife path.title-nolife { fill: url(#green-vertical-gradient); } svg.rg g.big-panel-nolife path.labels-nolife { fill: #A0E893; } svg.rg g.big-panel-nolife text.labels-nolife { fill: #61A457; } svg.rg g.big-panel-nolife path.block-nolife { fill: #588956; } svg.rg g.big-panel-nolife path.top-nolife.block-nolife, svg.rg g.big-panel-nolife path.bottom-nolife.stroke-nolife { stroke: #78886E; } svg.rg g.big-panel-nolife path.top-nolife.stroke-nolife, svg.rg g.big-panel-nolife path.bottom-nolife.block-nolife { stroke: #447031; } svg.vg .stroke-nolife { stroke: #96C2EE;96C2EE } svg.vg .stroke2-nolife { stroke: #306EBE; } svg.vg .fill-nolife { fill: url(#blue-radial-gradient); } svg.vg g.big-panel-nolife path.title-nolife { fill: url(#blue-vertical-gradient); } svg.vg g.big-panel-nolife path.labels-nolife { fill: #96C2EE; } svg.vg g.big-panel-nolife text.labels-nolife { fill: #34709E; } svg.vg g.big-panel-nolife path.block-nolife { fill: #0071C3; } svg.vg g.big-panel-nolife path.top-nolife.block-nolife, svg.vg g.big-panel-nolife path.bottom-nolife.stroke-nolife { stroke: #4C91D4; } svg.vg g.big-panel-nolife path.top-nolife.stroke-nolife, svg.vg g.big-panel-nolife path.bottom-nolife.block-nolife { stroke: #00518D; } svg.o .stroke-nolife { stroke: #E4E4E4; } svg.o .stroke2-nolife { stroke: #DBDBDB; } svg.o circle.fill-nolife { fill: url(#white-radial-gradient); } svg.o g.big-panel-nolife path.title-nolife { fill: url(#white-vertical-gradient); } svg.o g.big-panel-nolife path.labels-nolife { fill: #E4E4E4; } svg.o g.big-panel-nolife text.labels-nolife { fill: #919191; } svg.o g.big-panel-nolife path.block-nolife { fill: #D5D5D5; } svg.o g.big-panel-nolife path.top-nolife.block-nolife, svg.o g.big-panel-nolife path.bottom-nolife.stroke-nolife { stroke: #D6D6D6; } svg.o g.big-panel-nolife path.top-nolife.stroke-nolife, svg.o g.big-panel-nolife path.bottom-nolife.block-nolife { stroke: #9A9A9A; }</style>');
      $("html > head").append(style);
    }
  }

  function createFullscreenLayer() {
    if ($("#fullscreen-layer").length == 0) {
      const fullscreenLayer = $('<div id="fullscreen-layer" style="position: absolute; z-index: 10; cursor: pointer; left: 0; top: 0; width: 100%; height: 100%;"><iframe class="unselectable" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%;" id="yt-resize-frame"></iframe></div>');
      fullscreenLayer.dblclick(function (event) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          $(this).parent().get(0).requestFullscreen();
        }
      }).mousemove(function (event) {
        $(this).css("cursor", "pointer");

        let svg = $(this).find("svg");
        let newSvg = svg.clone();
        newSvg.one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function (event) {
          $("#fullscreen-layer").css("cursor", "none");
        });
        svg.before(newSvg);
        svg.remove();
      });
      const ytWatermark = $('<a id="yt-watermark" style="position: absolute; z-index: 10; width: 142px; height: 58px" target="_blank" aria-label="Regarder sur www.youtube.com" href=""><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="26" version="1.1" viewBox="0 0 110 26" width="110" style="pointer-events: none; position: absolute; top: 16px; left: 16px;"><path d="M 16.68,.99 C 13.55,1.03 7.02,1.16 4.99,1.68 c -1.49,.4 -2.59,1.6 -2.99,3 -0.69,2.7 -0.68,8.31 -0.68,8.31 0,0 -0.01,5.61 .68,8.31 .39,1.5 1.59,2.6 2.99,3 2.69,.7 13.40,.68 13.40,.68 0,0 10.70,.01 13.40,-0.68 1.5,-0.4 2.59,-1.6 2.99,-3 .69,-2.7 .68,-8.31 .68,-8.31 0,0 .11,-5.61 -0.68,-8.31 -0.4,-1.5 -1.59,-2.6 -2.99,-3 C 29.11,.98 18.40,.99 18.40,.99 c 0,0 -0.67,-0.01 -1.71,0 z m 72.21,.90 0,21.28 2.78,0 .31,-1.37 .09,0 c .3,.5 .71,.88 1.21,1.18 .5,.3 1.08,.40 1.68,.40 1.1,0 1.99,-0.49 2.49,-1.59 .5,-1.1 .81,-2.70 .81,-4.90 l 0,-2.40 c 0,-1.6 -0.11,-2.90 -0.31,-3.90 -0.2,-0.89 -0.5,-1.59 -1,-2.09 -0.5,-0.4 -1.10,-0.59 -1.90,-0.59 -0.59,0 -1.18,.19 -1.68,.49 -0.49,.3 -1.01,.80 -1.21,1.40 l 0,-7.90 -3.28,0 z m -49.99,.78 3.90,13.90 .18,6.71 3.31,0 0,-6.71 3.87,-13.90 -3.37,0 -1.40,6.31 c -0.4,1.89 -0.71,3.19 -0.81,3.99 l -0.09,0 c -0.2,-1.1 -0.51,-2.4 -0.81,-3.99 l -1.37,-6.31 -3.40,0 z m 29.59,0 0,2.71 3.40,0 0,17.90 3.28,0 0,-17.90 3.40,0 c 0,0 .00,-2.71 -0.09,-2.71 l -9.99,0 z m -53.49,5.12 8.90,5.18 -8.90,5.09 0,-10.28 z m 89.40,.09 c -1.7,0 -2.89,.59 -3.59,1.59 -0.69,.99 -0.99,2.60 -0.99,4.90 l 0,2.59 c 0,2.2 .30,3.90 .99,4.90 .7,1.1 1.8,1.59 3.5,1.59 1.4,0 2.38,-0.3 3.18,-1 .7,-0.7 1.09,-1.69 1.09,-3.09 l 0,-0.5 -2.90,-0.21 c 0,1 -0.08,1.6 -0.28,2 -0.1,.4 -0.5,.62 -1,.62 -0.3,0 -0.61,-0.11 -0.81,-0.31 -0.2,-0.3 -0.30,-0.59 -0.40,-1.09 -0.1,-0.5 -0.09,-1.21 -0.09,-2.21 l 0,-0.78 5.71,-0.09 0,-2.62 c 0,-1.6 -0.10,-2.78 -0.40,-3.68 -0.2,-0.89 -0.71,-1.59 -1.31,-1.99 -0.7,-0.4 -1.48,-0.59 -2.68,-0.59 z m -50.49,.09 c -1.09,0 -2.01,.18 -2.71,.68 -0.7,.4 -1.2,1.12 -1.49,2.12 -0.3,1 -0.5,2.27 -0.5,3.87 l 0,2.21 c 0,1.5 .10,2.78 .40,3.78 .2,.9 .70,1.62 1.40,2.12 .69,.5 1.71,.68 2.81,.78 1.19,0 2.08,-0.28 2.78,-0.68 .69,-0.4 1.09,-1.09 1.49,-2.09 .39,-1 .49,-2.30 .49,-3.90 l 0,-2.21 c 0,-1.6 -0.2,-2.87 -0.49,-3.87 -0.3,-0.89 -0.8,-1.62 -1.49,-2.12 -0.7,-0.5 -1.58,-0.68 -2.68,-0.68 z m 12.18,.09 0,11.90 c -0.1,.3 -0.29,.48 -0.59,.68 -0.2,.2 -0.51,.31 -0.81,.31 -0.3,0 -0.58,-0.10 -0.68,-0.40 -0.1,-0.3 -0.18,-0.70 -0.18,-1.40 l 0,-10.99 -3.40,0 0,11.21 c 0,1.4 .18,2.39 .68,3.09 .49,.7 1.21,1 2.21,1 1.4,0 2.48,-0.69 3.18,-2.09 l .09,0 .31,1.78 2.59,0 0,-14.99 c 0,0 -3.40,.00 -3.40,-0.09 z m 17.31,0 0,11.90 c -0.1,.3 -0.29,.48 -0.59,.68 -0.2,.2 -0.51,.31 -0.81,.31 -0.3,0 -0.58,-0.10 -0.68,-0.40 -0.1,-0.3 -0.21,-0.70 -0.21,-1.40 l 0,-10.99 -3.40,0 0,11.21 c 0,1.4 .21,2.39 .71,3.09 .5,.7 1.18,1 2.18,1 1.39,0 2.51,-0.69 3.21,-2.09 l .09,0 .28,1.78 2.62,0 0,-14.99 c 0,0 -3.40,.00 -3.40,-0.09 z m 20.90,2.09 c .4,0 .58,.11 .78,.31 .2,.3 .30,.59 .40,1.09 .1,.5 .09,1.21 .09,2.21 l 0,1.09 -2.5,0 0,-1.09 c 0,-1 -0.00,-1.71 .09,-2.21 0,-0.4 .11,-0.8 .31,-1 .2,-0.3 .51,-0.40 .81,-0.40 z m -50.49,.12 c .5,0 .8,.18 1,.68 .19,.5 .28,1.30 .28,2.40 l 0,4.68 c 0,1.1 -0.08,1.90 -0.28,2.40 -0.2,.5 -0.5,.68 -1,.68 -0.5,0 -0.79,-0.18 -0.99,-0.68 -0.2,-0.5 -0.31,-1.30 -0.31,-2.40 l 0,-4.68 c 0,-1.1 .11,-1.90 .31,-2.40 .2,-0.5 .49,-0.68 .99,-0.68 z m 39.68,.09 c .3,0 .61,.10 .81,.40 .2,.3 .27,.67 .37,1.37 .1,.6 .12,1.51 .12,2.71 l .09,1.90 c 0,1.1 .00,1.99 -0.09,2.59 -0.1,.6 -0.19,1.08 -0.49,1.28 -0.2,.3 -0.50,.40 -0.90,.40 -0.3,0 -0.51,-0.08 -0.81,-0.18 -0.2,-0.1 -0.39,-0.29 -0.59,-0.59 l 0,-8.5 c .1,-0.4 .29,-0.7 .59,-1 .3,-0.3 .60,-0.40 .90,-0.40 z"></path></svg></a>');
      ytWatermark.click(function () {
        const media = API.getMedia();
        if (media) {
          $(this).attr("href", `https://www.youtube.com/watch?time_continue=${API.getTimeElapsed()}&v=${media.cid}`);
        }
      }).mouseover(function () {
        const media = API.getMedia();
        if (media) {
          $(this).attr("href", `https://www.youtube.com/watch?v=${media.cid}`);
        }
      });
      $("#yt-frame").before(fullscreenLayer.append(ytWatermark));
      $(".community__playing-controls").css("pointer-events", "none");
      $(".community__playing-top-buttons").css("pointer-events", "auto");
      document.getElementById("yt-resize-frame").contentWindow.addEventListener("resize", function () {
        rescale();
        panelNolifeResize();
      });
    }
  }

  function createObserver(element, config, callback) {
    let observer = new MutationObserver(callback);
    observer.observe(element, config);
    return observer;
  }

  function install() {
    console.log(`plug.dj tools v${version}`);
    let playlistMenu = false,
      mediaPanel = false,
      userProfile = false,
      app = false,
      communitySongPlaying = false,
      playlistButtonsContent = false,
      ytFrame = false,
      dialogContainer = false,
      communityMeta = false;

    function checkAll() {
      playlistMenu = playlistMenu || (document.getElementById("playlist-menu") != null);
      mediaPanel = mediaPanel || (document.getElementById("media-panel") != null);
      userProfile = userProfile || (document.getElementsByClassName("user-profile").length > 0);
      app = app || (document.getElementById("app") != null);
      communitySongPlaying = communitySongPlaying || (document.getElementsByClassName("community__song-playing").length > 0);
      playlistButtonsContent = playlistButtonsContent || (document.getElementsByClassName("playlist-buttons-content").length > 0);
      dialogContainer = dialogContainer || (document.getElementById("dialog-container") != null);
      communityMeta = communityMeta || (document.getElementsByClassName("community__meta").length > 0);

      return playlistMenu && mediaPanel && userProfile && app && playlistButtonsContent && communitySongPlaying && dialogContainer && communityMeta;
    }

    function checkFsl() {
      ytFrame = ytFrame || (document.getElementById("yt-frame") != null);
      return ytFrame;
    }

    let all = checkAll();
    let fsl = checkFsl();

    if (all) {
      createAll();
    }
    if (fsl) {
      createFullscreenLayer();
    }

    if (!all || !fsl) {
      let observer = createObserver(document.body, {
        attributes: false,
        childList: true,
        subtree: true
      }, function (mutationsList, observer) {
        if (!all) {
          all = checkAll();
          if (all) {
            createAll();
          }
        }
        if (!fsl) {
          fsl = checkFsl();
          if (fsl) {
            createFullscreenLayer();
          }
        }
        if (all && fsl) {
          observer.disconnect();
        }
      });
    }
  }

  function createPlaylistButtons() {
    createGearButton();
    createClearButton();
    createSortButton();
    createRefreshButton();
    createCutCopyPasteButton();
    createSynchroButton();
    createAddButton();
  }

  function createTopButtons() {
    createRefreshMedia();
  }

  async function refreshMedia() {
    const state = await fetchState();
    if (await state.length > 0) {
      const state0 = await state[0];
      if (await state0.booth.currentDJ == API.getDJ().id) {
        const media = API.getMedia();
        if (media && (media.cid == await state0.playback.media.cid)) {
          media.author = await state0.playback.media.author;
          media.title = await state0.playback.media.title;
          advanceMedia(media, false);
        }
      }
    }
  }

  function createRefreshMedia() {
    createTopButton("refresh", "refresh", "", refreshMedia);
  }

  function createTopButton(id, fa, text, click) {
    let button = $(`#top-${id}-button`);
    if (button.length == 0) {
      button = $(`<li id="top-${id}-button" class="community__info-item"><p class="tooltipstered"><i class="fa fa-${fa}" aria-hidden="true"></i><span class="community__info-item-text">${text}</span></p></li>`);
      button.click(click);
      $("div.community__info ul.list-unstyled.clearfix").append(button);
    }
    return button;
  }

  function formatDate(date) {
    let format = "" + (date.getFullYear() * 10000000000 + (date.getMonth() + 1) * 100000000 + date.getDate() * 1000000 + date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds());
    return format.substr(0, 4) + "-" + format.substr(4, 2) + "-" + format.substr(6, 2) + "_" + format.substr(8, 2) + "-" + format.substr(10, 2) + "-" + format.substr(12, 2);
  }

  function replaceEntities(string) {
    return string.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
  }

  function replaceMacrons(string) {
    return string.replace(/ā/g, "â").replace(/Ā/g, "Â").replace(/ē/g, "ê").replace(/Ē/g, "Ê").replace(/ī/g, "î").replace(/Ī/g, "Î").replace(/ō/g, "ô").replace(/Ō/g, "Ô").replace(/ū/g, "û").replace(/Ū/g, "Û");
  }

  function replaceForbidden(string) {
    return string.replace(/@/g, "＠").replace(/\//g, "⧸");
  }

  function restoreForbidden(string) {
    return string.replace(/＠/g, "@").replace(/⧸/g, "/");
  }

  function patchExport(data) {
    data.forEach(function (data) {
      if ((data.format == 1) && (data.image.endsWith(`//i.ytimg.com/vi/${data.cid}/default.jpg`))) {
        data.image = "";
      }
      data.title = restoreForbidden(replaceEntities(data.title));
      data.author = restoreForbidden(replaceEntities(data.author));
    });
    return data;
  }

  function generateTsv(tsv) {
    const link = document.createElement("a");
    link.setAttribute("download", "export_" + tsvTypeExport + "_" + formatDate(new Date()) + ".tsv");
    link.setAttribute("href", "data:text/tab-separated-values;charset=utf-8;base64," + window.btoa(unescape(encodeURIComponent(tsv))));
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function exportTsv() {
    const plColumns = tsvExportColumns.filter(column => column.startsWith("pl-"));
    const atColumns = plColumns.map(column => column.substr(3));
    const columns = tsvExportColumns.filter(column => !column.startsWith("pl-"));
    const header = plColumns.join(tsvColumnSeparator) + tsvColumnSeparator + columns.join(tsvColumnSeparator);
    const playlists = getPlaylists().filter(playlist => playlist.attributes.checked);
    if (playlists.length == 0) {
      const playlist = {
        name: "History",
        id: ""
      };
      generateTsv(patchExport(API.getHistory().map(history => history.media).slice()).reduce((tsv, row) => columns.reduce((tsv, column) => tsv + tsvColumnSeparator + row[column], atColumns.reduce((tsv, column, index) => tsv + ((index > 0) ? tsvColumnSeparator : "") + playlist[column], tsv + tsvRowTerminator), tsv), header));
    } else {
      playlists.filter(playlist => playlist.attributes.checked).reduce((tsv, playlist) => tsv.then(tsv => fetchPlaylist(playlist.id).then(data => patchExport(data).reduce((tsv, row) => columns.reduce((tsv, column) => tsv + tsvColumnSeparator + row[column], atColumns.reduce((tsv, column, index) => tsv + ((index > 0) ? tsvColumnSeparator : "") + playlist.attributes[column], tsv + tsvRowTerminator)), tsv))), Promise.resolve(header)).then(generateTsv);
    }
  }

  function createPlaylistsButtons() {
    if ($(".playlist-buttons-import-export-tsv").length == 0) {
      const playlistButtonsImportExportTsv = $('<div class="playlist-buttons-import-export-tsv"></div>');

      let playlistExportTsv = $('<div id="playlist-export-tsv" class="button"><i class="fa fa-sign-in"></i><span>Export TSV</span></div>');
      playlistExportTsv.click(function (event) {
        if (event.ctrlKey && event.altKey) {
          tsvExportColumns = tsvExportColumnsAdvanced;
          tsvTypeExport = tsvTypeExportAdvanced;
        } else {
          tsvExportColumns = tsvExportColumnsNormal;
          tsvTypeExport = tsvTypeExportNormal;
        }
        exportTsv();
      });
      playlistButtonsImportExportTsv.append(playlistExportTsv);

      $('.playlist-buttons-content').append(playlistButtonsImportExportTsv);
    }
  }

  function updateMedia(author, title) {
    $("#dialog-media-update input[name=author]").val(author);
    $("#dialog-media-update input[name=title]").val(title);
    if ((author != "") && (title != "")) {
      $("#dialog-media-update").removeClass("no-submit");
    }
  }

  function createMediaUpdate() {
    let index = $("#media-panel .media-list.playlist-media .row .actions").parent().index() + Math.floor($("#media-panel .media-list.playlist-media .row").first().height() / 55) - 1;
    if (index >= 0) {
      let media = getVisiblePlaylistMedias().slice(0)[index];
      if ($("#dialog-media-update .tag").length == 0) {
        const tag = $('<style scoped>.tag { position: absolute; background-color: #00c6ff; border-radius: 50%; right: 40px; top: 55px; width: 30px; height: 30px; cursor: pointer; } .tag i { left: 0; top: 0;} }</style><div class="tag"><i class="icon icon-import-big"></i></div>');
        tag.last().click(async function (event) {
          let data = await mediaTag([{
            cid: media.attributes.cid,
            author: restoreForbidden(replaceEntities(media.attributes.author)),
            title: restoreForbidden(replaceEntities(media.attributes.title))
          }]);
          if (data[0].status == "ok") {
            $(this).css("background-color", "#00c600");
          } else {
            $(this).css("background-color", "#c60000");
          }
          updateMedia(data[0].author, data[0].title);
        });
        $("#dialog-media-update .dialog-body").append(tag);
        const restore = $('<style scoped>.restore { position: absolute; background-color: #00c6ff; border-radius: 50%; right: 74px; top: 55px; width: 30px; height: 30px; cursor: pointer; } .restore i { left: 0; top: 0;} }</style><div class="restore"><i class="icon icon-refresh-video"></i></div>');
        restore.last().click(async function (event) {
          updateMedia(restoreForbidden(replaceEntities(media.attributes.author)), restoreForbidden(replaceEntities(media.attributes.title)));
        });
        $("#dialog-media-update .dialog-body").append(restore);

        const author = $("#dialog-media-update input[name=author]");
        const title = $("#dialog-media-update input[name=title]");
        author.val(restoreForbidden(author.val()));
        title.val(restoreForbidden(title.val()));
        title.prop("maxlength", "256");

        $("#dialog-media-update input[name=author], #dialog-media-update input[name=title]").off("keydown").keydown(function (event) {
          if (event.which == 27) {
            event.stopPropagation();
            event.preventDefault();
            $("#dialog-media-update .button.cancel").click();
          }
        });
        $("#dialog-media-update .button.submit").mousedown(function () {
          if (!$("#dialog-media-update").hasClass("no-submit")) {
            const author = $("#dialog-media-update input[name=author]");
            const title = $("#dialog-media-update input[name=title]");
            author.val(replaceForbidden(author.val()));
            title.val(replaceForbidden(title.val()));

            if ((API.getMedia() != undefined) && (media.attributes.cid == API.getMedia().cid) && (API.getDJ() != undefined) && (API.getDJ().id == API.getUser().id)) {
              const media = API.getMedia();
              media.author = author.val();
              media.title = title.val();
              advanceMedia(media, false);
            }
          }
        });
      }
    }
  }

  function closeUserLogoPopup() {
    $(".user-logo-dropdown").parent().attr("data-state", "hidden").removeClass("user-profile-dropdown");
  }

  function createUserLogoBouncer() {
    if ($(".user-logo").length == 0) {
      const bouncer = $('<div class="user-logo user-profile role-bouncer role-none"><div class="avatar-wrapper thumb small"><div class="background"></div>' + iconNolife(logoIndex, 'style="position: absolute; top: 2px; z-index: 2;"', 24, 20) + '</div></div>');
      bouncer.click(function (event) {
        const position = $(this).offset();
        const right = position.left + $(this).width() / 2;
        const bottom = position.top + $(this).height();
        const popover = $(".user-logo-dropdown").parent();
        popover.attr("data-state", "shown").addClass("user-profile-dropdown").css("left", (right - popover.width()) + "px").css("top", (bottom + 20) + "px");
        event.stopPropagation();
      });

      $(".user-profile").before(bouncer);

      let popover = '<div class="popover" data-state="hidden"><div class="user-logo-dropdown"><ul class="list-unstyled">';
      for (let i = 0; i < logoEdges.length; i++) {
        popover += '<li class="user-profile-dropdown__item user-action">' + iconNolife(i, "", 20, 16) + '<span class="user-profile-dropdown__item-text">' + resLogoTitles[i] + '</span></li>';
      }

      for (let i = 0; i < logoOldN.length; i++) {
        if (logoOldN[i] != undefined) {
          popover += `<li class="user-profile-dropdown__item user-action" style="position: absolute; min-width: 0; top: ${8 + 45 * i}px; left: 136px"><span class="user-profile-dropdown__item-text">${resOld}</span></li>`;
        }
      }
      popover += '</ul></div></div>';
      popover = $(popover);
      popover.find("li").click(function () {
        logoIndex = $(this).index();
        if (logoIndex >= logoLetters.length) {
          logoIndex += 2;
        }
        let room = document.getElementById("app").getAttribute("data-theme");
        logoChanged = (logoRoom(room) && (logoIndex != 7)) || (!logoRoom(room) && (logoIndex != 0));
        if (logoIndex != tempLogoIndex) {
          previousLogoIndex = logoIndex;
          changeLogo();
        }
        panelNolifeUpdate(API.getMedia());
        closeUserLogoPopup();
      }).mousedown(function (event) {
        event.stopPropagation();
      });
      $(".popover").filter(":last").after(popover);
      $(document).mousedown(closeUserLogoPopup);
    }
  }

  function createPlaylistButton(id, fa, click) {
    let button = $(`#playlist-${id}-button`);
    if (button.length == 0) {
      button = $(`<div id="playlist-${id}-button" class="button"><i class="fa fa-${fa}"></i></div>`);
      button.click(click);
      $("#media-panel .playlist-buttons-container .playlist-edit-group").prepend(button);
    }
    return button;
  }

  async function gear(playlists, id, initialCount, max, appendMode, maxArtist, checkMyHistory, checkHistory) {
    let cids = getCids(checkMyHistory, checkHistory);
    let finalCount;
    if (appendMode == "overwrite") {
      finalCount = max;
    } else {
      finalCount = initialCount + max;
    }
    if (finalCount > maxPlaylist) {
      finalCount = maxPlaylist;
    }
    let randomIndexes = getPlaylistsIndexes(playlists);
    let count = initialCount;
    let artistCount = [];
    for (;;) {
      let removedIndexes = getRandomIndexes(randomIndexes, max);
      let randomPlaylist = await getRandomPlaylist(playlists, randomIndexes, artistCount, maxArtist, cids);
      if ((appendMode == "overwrite") && (initialCount != 0)) {
        await clearPlaylist(id);
        initialCount = 0;
      }
      if (randomPlaylist.length > 0) {
        let data = await insertPlaylist(id, randomPlaylist, appendMode == "end");
        count = await data[0].count;
        max = finalCount - count;
        if (max <= 0) {
          break;
        }
      }
      randomIndexes = removedIndexes;
      if (randomIndexes.length == 0) {
        break;
      }
    }
    await refreshPlaylist(id, count);
  }

  function gearDialog(playlists, id, name, count, total) {
    $("#dialog-container").html(`<div id="dialog-playlist-delete" class="dialog destructive no-submit"><div class="dialog-frame"><span class="title">${resGearPlaylist}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message">${resGearName(name)}</span><div class="dialog-input-container"><span class="dialog-input-label">${resTypeTracksCountToGenerate(total)}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeTracksCount}" name="max-tracks" value=""></div></div><div class="dialog-input-container"><span class="dialog-input-label">${resMaxByArtist}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeMaxByArtist}" name="max-by-artist" value=""></div></div><div class="dialog-input-container"><div class="dialog-input-background" style="height: 39px"><dl id="dropdownAppendMode" class="dropdown"><dt><span>${resBeginning}</span><i id="down" class="fa fa-angle-down"></i><i class="fa fa-angle-up" id="up"></i></dt><dd><div class="row selected" data-value="beginning"><span>${resBeginning}</span></div><div class="row" data-value="end"><span>${resEnd}</span></div><div class="row" data-value="overwrite"><span>${resOverwrite}</span></div></dd></dl></div></div></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resGearPlaylist}</span></div></div></div>`).css("display", "block").click(function (event) {
      let cid = $(event.target).prop('id');
      if (cid == "") {
        cid = $(event.target).prop('class');
        if (cid == "") {
          cid = $(event.target).parent().prop('class');
        }
      }

      if (cid == "button submit") {
        if ($("#dialog-playlist-delete").hasClass("no-submit") == false) {
          gear(playlists, id, count, parseInt($("#dialog-playlist-delete input[name=max-tracks]").val(), 10), $("#dialog-playlist-delete #dropdownAppendMode dd .row.selected").attr("data-value"), parseInt($("#dialog-playlist-delete input[name=max-by-artist]").val(), 10), true, true);
        } else {
          cid = "";
        }
      }

      if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid)) {
        $(this).html('').css("display", "none");
        $(this).unbind(event);
      }
    });
    $("#dialog-playlist-delete input").focus(function () {
      $(this).parent().addClass("focused");
    }).blur(function () {
      $(this).parent().removeClass("focused");
    }).keyup(function () {
      const maxTracks = parseInt($("#dialog-playlist-delete input[name=max-tracks]").val(), 10);
      const maxByArtist = $("#dialog-playlist-delete input[name=max-by-artist]").val();
      if (maxTracks >= 1 && maxTracks <= maxPlaylist && ((maxByArtist == "") || (parseInt(maxTracks, 10) >= 1 && parseInt(maxTracks, 10) <= maxPlaylist))) {
        $("#dialog-playlist-delete").removeClass("no-submit");
      } else {
        $("#dialog-playlist-delete").addClass("no-submit");
      }
    }).keydown(function (event) {
      if (event.which == 27) {
        event.stopPropagation();
        event.preventDefault();
        $("#dialog-playlist-delete .button.cancel").click();
      }
    });
    $("#dialog-playlist-delete dt").click(function () {
      $(this).parent().toggleClass("open");
    });
    $("#dialog-playlist-delete dd .row").click(function () {
      $(this).parent().find(".row").removeClass("selected");
      $(this).addClass("selected").parent().parent().removeClass("open").find("dt span").html($(this).find("span").html());
    });
  }

  async function clear(id, medias) {
    let data;
    if (medias) {
      data = await deletePlaylist(id, medias);
    } else {
      data = await clearPlaylist(id);
    }
    const count = await data.length;
    await refreshPlaylist(id, count);
  }

  function clearCheckedDialog(id, name, medias) {
    $("#dialog-container").html(`<div id="dialog-confirm" class="dialog destructive"><div class="dialog-frame"><span class="title">${resDeleteMedia}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message" style="top: 63.5px;">${(medias.length == 1) ? resDeleteItem(medias[0].attributes.author, medias[0].attributes.title) : resDeleteItems(medias.length)}</span></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resDeleteMedia}</span></div></div></div>`).css("display", "block").click(function (event) {
      let cid = $(event.target).prop('id');
      if (cid == "") {
        cid = $(event.target).prop('class');
        if (cid == "") {
          cid = $(event.target).parent().prop('class');
        }
      }

      if (cid == "button submit") {
        if ($("#dialog-confirm").hasClass("no-submit") == false) {
          clear(id, medias);
        } else {
          cid = "";
        }
      }

      if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid)) {
        $(this).html('').css("display", "none");
        $(this).unbind(event);
      }
    });
  }

  function clearAllDialog(id, name) {
    const code = getRandomInt(900) + 100;
    $("#dialog-container").html(`<div id="dialog-playlist-delete" class="dialog destructive no-submit"><div class="dialog-frame"><span class="title">${resClearPlaylist}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message">${resClearName(name)}</span><div class="dialog-input-container"><span class="dialog-input-label">${resTypeCodeToClear(code)}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeCode(code)}" name="code" value=""></div></div></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resClearPlaylist}</span></div></div></div>`).css("display", "block").click(function (event) {
      let cid = $(event.target).prop('id');
      if (cid == "") {
        cid = $(event.target).prop('class');
        if (cid == "") {
          cid = $(event.target).parent().prop('class');
        }
      }

      if (cid == "button submit") {
        if ($("#dialog-playlist-delete").hasClass("no-submit") == false) {
          clear(id);
        } else {
          cid = "";
        }
      }

      if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid)) {
        $(this).html('').css("display", "none");
        $(this).unbind(event);
      }
    });
    $("#dialog-playlist-delete input").focus(function () {
      $(this).parent().addClass("focused");
    }).blur(function () {
      $(this).parent().removeClass("focused");
    }).keyup(function () {
      if ($(this).val() == code) {
        $("#dialog-playlist-delete").removeClass("no-submit");
      } else {
        $("#dialog-playlist-delete").addClass("no-submit");
      }
    }).keydown(function (event) {
      if (event.which == 27) {
        event.stopPropagation();
        event.preventDefault();
        $("#dialog-playlist-delete .button.cancel").click();
      }
    });
  }

  function createGearButton() {
    createPlaylistButton("gears", "gears", function () {
      let id = -1;
      let name = "";
      let count = 0;
      let total = 0;
      let playlists = getPlaylists();
      let checkedPlaylists = playlists.reduce(function (result, element, index, array) {
        let last = 0;
        if (result.length > 0) last = result[result.length - 1].last;
        if (element.attributes.visible) {
          id = element.attributes.id;
          name = element.attributes.name;
          count = element.attributes.count;
        } else if (element.attributes.checked) {
          result.push({
            name: element.attributes.name,
            count: element.attributes.count,
            id: element.attributes.id,
            first: last,
            last: last + element.attributes.count
          });
          total += element.attributes.count;
        }
        return result;
      }, []);
      if ((id != -1) && (checkedPlaylists.length > 0)) {
        gearDialog(checkedPlaylists, id, name, count, total);
      }
    });
  }

  function createClearButton() {
    createPlaylistButton("clear", "eraser", function () {
      const visiblePlaylist = getVisiblePlaylist();
      if (visiblePlaylist != undefined) {
        const medias = getCheckedPlaylistMedias().slice(0);
        if (medias.length) {
          clearCheckedDialog(visiblePlaylist.attributes.id, visiblePlaylist.attributes.name, medias);
        } else {
          clearAllDialog(visiblePlaylist.attributes.id, visiblePlaylist.attributes.name);
        }
      }
    });
  }

  async function sort(id) {
    const medias = getVisiblePlaylistMedias();
    medias.sort((element1, element2) => (element1.attributes.author == element2.attributes.author) ? element1.attributes.title.localeCompare(element2.attributes.title) : element1.attributes.author.localeCompare(element2.attributes.author));
    const data = await movePlaylist(id, medias, -1);
    const count = await data.length;
    await refreshPlaylist(id, count);
  }

  function sortDialog(id, name) {
    $("#dialog-container").html(`<div id="dialog-confirm" class="dialog destructive"><div class="dialog-frame"><span class="title">${resSortPlaylist}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message" style="top: 63.5px;">${resSortName(name)}</span></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resSortPlaylist}</span></div></div></div>`).css("display", "block").click(function (event) {
      let cid = $(event.target).prop('id');
      if (cid == "") {
        cid = $(event.target).prop('class');
        if (cid == "") {
          cid = $(event.target).parent().prop('class');
        }
      }

      if (cid == "button submit") {
        if ($("#dialog-confirm").hasClass("no-submit") == false) {
          sort(id);
        } else {
          cid = "";
        }
      }

      if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid)) {
        $(this).html('').css("display", "none");
        $(this).unbind(event);
      }
    });
  }

  function createSortButton() {
    createPlaylistButton("sort", "sort-alpha-asc", function () {
      const visiblePlaylist = getVisiblePlaylist();
      if (visiblePlaylist != undefined) {
        if (visiblePlaylist.attributes.active) {
          sortDialog(visiblePlaylist.attributes.id, visiblePlaylist.attributes.name);
        } else {
          sort(visiblePlaylist.attributes.id);
        }
      }
    });
  }

  function createRefreshButton() {
    createPlaylistButton("refresh", "refresh", function () {
      const visiblePlaylist = getVisiblePlaylist();
      if (visiblePlaylist != undefined) {
        refreshPlaylist(visiblePlaylist.attributes.id);
      }
    });
  }

  async function paste(ctrl) {
    if (ctrl) {
      let contents = await navigator.clipboard.readText();
      let tsv = await contents.replace(/\r?\n|\r/g, "\n").replace(/\n*$/, "").split("\n");
      let tsvPasteColumns;
      let normal;
      const columns = tsv.shift().split(tsvColumnSeparator);
      let needed = columns.filter(column => tsvPasteNeedColumnsAdvanced.includes(column));
      if (needed.length != tsvPasteNeedColumnsAdvanced.length) {
        needed = columns.filter(column => tsvPasteNeedColumnsNormal.includes(column));
        if (needed.length != tsvPasteNeedColumnsNormal.length) {
          console.error("Some columns are missing");
          return;
        } else {
          tsvPasteColumns = tsvPasteNeedColumnsNormal;
          normal = true;
        }
      } else {
        tsvPasteColumns = tsvPasteNeedColumnsAdvanced;
        normal = false;
      }

      const imported = columns.map((name, index) => {
        const column = {
          name: name,
          index: index
        };
        return column;
      }).filter(column => tsvPasteColumns.includes(column.name));

      let errors = 0;
      tsv = tsv.map((row, line) => {
        const result = {
          id: 0
        };
        row = row.split(tsvColumnSeparator);
        if (columns.length == row.length) {
          imported.forEach(column => result[column.name] = row[column.index]);
          if (normal) {
            result.format = parseInt(result.format, 10);
            if (isNaN(result.format) || (result.format < 1) || (result.format > 2)) {
              console.error(`Line ${line + 2} has not a correct format`);
              errors++;
            }
            result.duration = parseInt(result.duration, 10);
            if (isNaN(result.duration) || (result.duration <= 0)) {
              console.error(`Line ${line + 2} has not a correct duration`);
              errors++;
            }

            if (!result.image) {
              if (result.format == 1) {
                result.image = `https://i.ytimg.com/vi/${result.cid}/default.jpg`;
              } else {
                console.error(`Line ${line + 2} has not a correct image (soundcloud)`);
                errors++;
              }
            }
          } else {
            result.id = parseInt(result.id, 10);
            if (isNaN(result.id) || (result.id < 0)) {
              console.error(`Line ${line + 2} has not a correct id`);
              errors++;
            }
          }
        } else {
          console.error(`Line ${line + 2} has not the right number of columns`);
          errors++;
        }
        return result;
      });

      if (errors == 0) {
        const visiblePlaylist = getVisiblePlaylist();
        if (visiblePlaylist != undefined) {
          let id = visiblePlaylist.attributes.id;
          let count;
          try {
            let data = await insertPlaylist(id, (normal) ? null : tsv, false, (normal) ? tsv : null);
            count = await data[0].count;
          } catch (exception) {
            if (exception == "maxItems") {
              count = maxPlaylist;
            } else {
              throw exception;
            }
          }
          await refreshPlaylist(id, count);
        }
      }
    } else if (clipBoard.id && clipBoard.medias.length > 0) {
      const visiblePlaylist = getVisiblePlaylist();
      if (visiblePlaylist != undefined) {
        let id = visiblePlaylist.attributes.id;
        let count;
        try {
          let data = await insertPlaylist(id, clipBoard.medias, false);
          count = await data[0].count;
        } catch (exception) {
          if (exception == "maxItems") {
            count = maxPlaylist;
          } else {
            throw exception;
          }
        }
        await refreshPlaylist(id, count);

        if ((clipBoard.cut) && (id != clipBoard.id)) {
          let data = await fetchPlaylist(id);
          let ids = clipBoard.medias.map(element => element.id);
          let medias = await data.filter(element => ids.includes(element.id));
          data = await deletePlaylist(clipBoard.id, medias);
          let count = await data.length;
          refreshPlaylist(clipBoard.id, count);
        }
      }
    }
  }

  function exportTsv() {
    const plColumns = tsvExportColumns.filter(column => column.startsWith("pl-"));
    const atColumns = plColumns.map(column => column.substr(3));
    const columns = tsvExportColumns.filter(column => !column.startsWith("pl-"));
    const header = plColumns.join(tsvColumnSeparator) + tsvColumnSeparator + columns.join(tsvColumnSeparator);
    const playlists = getPlaylists().filter(playlist => playlist.attributes.checked);
    if (playlists.length == 0) {
      const playlist = {
        name: "History",
        id: ""
      };
      generateTsv(patchExport(API.getHistory().map(history => history.media).slice()).reduce((tsv, row) => columns.reduce((tsv, column) => tsv + tsvColumnSeparator + row[column], atColumns.reduce((tsv, column, index) => tsv + ((index > 0) ? tsvColumnSeparator : "") + playlist[column], tsv + tsvRowTerminator), tsv), header));
    } else {
      playlists.filter(playlist => playlist.attributes.checked).reduce((tsv, playlist) => tsv.then(tsv => fetchPlaylist(playlist.id).then(data => patchExport(data).reduce((tsv, row) => columns.reduce((tsv, column) => tsv + tsvColumnSeparator + row[column], atColumns.reduce((tsv, column, index) => tsv + ((index > 0) ? tsvColumnSeparator : "") + playlist.attributes[column], tsv + tsvRowTerminator)), tsv))), Promise.resolve(header)).then(generateTsv);
    }
  }

  function copyCut(cut, ctrl) {
    if (ctrl) {
      const plColumns = tsvCopyColumns.filter(column => column.startsWith("pl-"));
      const atColumns = plColumns.map(column => column.substr(3));
      const columns = tsvCopyColumns.filter(column => !column.startsWith("pl-"));
      const header = plColumns.join(tsvColumnSeparator) + tsvColumnSeparator + columns.join(tsvColumnSeparator);
      const playlist = getVisiblePlaylist().attributes;

      let medias = getCheckedPlaylistMedias().slice(0);
      if (medias.length == 0) {
        medias = getVisiblePlaylistMedias().slice(0);
      }
      let text = patchExport(medias.map(media => media.attributes)).reduce((tsv, row) => columns.reduce((tsv, column) => tsv + tsvColumnSeparator + row[column], atColumns.reduce((tsv, column, index) => tsv + ((index > 0) ? tsvColumnSeparator : "") + playlist[column], tsv + tsvRowTerminator), tsv), header);
      navigator.clipboard.writeText(text);
    } else {
      clipBoard.cut = cut;
      clipBoard.id = getVisiblePlaylist().attributes.id;
      clipBoard.medias = getCheckedPlaylistMedias().slice(0);
    }
  }

  function createCutCopyPasteButton() {
    createPlaylistButton("paste", "paste", function (event) {
      paste(event.ctrlKey);
    });
    createPlaylistButton("copy", "copy", function (event) {
      copyCut(false, event.ctrlKey);
    });
    createPlaylistButton("cut", "cut", function () {
      copyCut(true, false);
    });
  }

  async function synchro(clean) {
    const playlist = getVisiblePlaylist();
    const id = playlist.attributes.id;
    const medias = getCheckedPlaylistMedias().slice(0);
    if (medias.length > 0) {
      if ($("#plugdj-tools-extension-synchro-css").length == 0) {
        const style = $('<style id="plugdj-tools-extension-synchro-css">@keyframes plugdj-tools-extension-spin { 100% { transform: rotate(360deg); } }</style>');
        $('html > head').append(style);
      } else {
        return;
      }

      try {
        const cids = medias.map(media => {
          if (clean)
            return {
              cid: media.attributes.cid,
              author: restoreForbidden(media.attributes.author),
              title: restoreForbidden(media.attributes.title)
            };
          else
            return {
              cid: media.attributes.cid
            };
        });
        const data = await mediaTag(cids);
        const updates = await medias.map(media => {
          const update = data.find(element => (element.cid == media.attributes.cid) && (element.author != undefined) && (element.title != undefined) && (replaceForbidden(element.author) != media.attributes.author || replaceForbidden(element.title) != media.attributes.title));
          if (update) return {
            id: media.attributes.id,
            author: replaceForbidden(update.author),
            title: replaceForbidden(update.title)
          };
          else return null;
        }).filter(element => element != null);
        await updatePlaylist(id, updates);
      } finally {
        $("#plugdj-tools-extension-synchro-css").remove();
        await refreshPlaylist(id);
      }
    }
  }

  function createSynchroButton() {
    createPlaylistButton("synchro", "database", function (event) {
      synchro(event.ctrlKey);
    }).css("animation", "plugdj-tools-extension-spin 4s linear infinite");
  }

  async function add() {
    let media = API.getMedia();
    if (media) {
      const visiblePlaylist = getVisiblePlaylist();
      if (visiblePlaylist != undefined) {
        let id = visiblePlaylist.attributes.id;
        let count;
        try {
          let data = await insertPlaylist(id, [{
            id: media.id
          }], visiblePlaylist.attributes.active);
          count = await data[0].count;
        } catch (exception) {
          if (exception == "maxItems") {
            count = maxPlaylist;
          } else {
            throw exception;
          }
        }
        await refreshPlaylist(id, count);
      }
    }
  }

  function createAddButton() {
    createPlaylistButton("add", "plus", function () {
      add();
    });
  }

  function createPlaylistsCheckboxes() {
    const playlists = getPlaylists();
    const rows = $("#playlist-menu .menu .container .row");
    rows.each(function (index, element) {
      if ($(element).find("div.item").length == 0) {
        let selected = "";
        if (playlists[index].attributes.checked) {
          selected = " selected";
        }
        const checkbox = $('<div class="item' + selected + '"><i class="icon icon-check-blue"></i></div>');
        checkbox.click(function (event) {
          if (event.detail == 1) {
            $(this).toggleClass("selected");
          }
          const parent = $(this).parent();
          const index = parent.index();
          const playlists = getPlaylists();
          const checked = $(this).hasClass("selected");
          playlists[index].attributes.checked = checked;
          if ((event.ctrlKey) || (event.detail > 1)) {
            const name = playlists[index].attributes.name;
            const minus = name.indexOf("-");
            if (minus >= 0) {
              const prefix = name.substr(0, minus + 1);
              playlists.forEach(function (element, index) {
                if ((element.attributes.name.startsWith(prefix)) && (checked != (element.attributes.checked == true))) {
                  element.attributes.checked = checked;
                  parent.parent().find("div.item").eq(index).toggleClass("selected");
                }
              });
            }
          } else if (event.altKey) {
            playlists.forEach(function (element, index) {
              if (checked != (element.attributes.checked == true)) {
                element.attributes.checked = checked;
                parent.parent().find("div.item").eq(index).toggleClass("selected");
              }
            });
          }
          event.stopPropagation();
        }).mouseup(function (event) {
          event.stopPropagation();
        });
        $(element).prepend(checkbox);
      }
    });
  }

  function createMediasCheckboxes() {
    if (busyMediasCheckboxes) return;
    busyMediasCheckboxes = true;

    const medias = getVisiblePlaylistMedias();
    const rows = $("#media-panel .media-list.playlist-media .row");
    const lastIndex = rows.length - 1;

    let offsetIndex = 0;

    rows.each(function (index, element) {
      if (index == 0) {
        if ($(this).prop("class") == "row") {
          offsetIndex = Math.floor($(this).height() / 55) - 1;
        } else {
          return false;
        }
      } else if (index < lastIndex) {
        let checkbox = $(element).find("div.item");
        if (checkbox.length == 0) {
          checkbox = $('<div class="item"><i class="icon icon-check-blue"></i></div>');
          $(element).prepend(checkbox);
        } else {
          checkbox.unbind();
        }
        const mediaIndex = index + offsetIndex;
        if ((mediaIndex < medias.length) && medias[mediaIndex].attributes.checked) {
          checkbox.addClass("selected");
        } else {
          checkbox.removeClass("selected");
        }
        checkbox.click(function (event) {
          busyMediasCheckboxes = true;
          if (event.detail == 1) {
            $(this).toggleClass("selected");
          }
          const medias = getVisiblePlaylistMedias();
          const media = medias[mediaIndex];
          const checked = $(this).hasClass("selected");
          media.attributes.checked = checked;
          const parent = $(this).parent().parent();
          if (event.ctrlKey) {
            const first = media.attributes.author.substr(0, 1).toLowerCase();
            medias.forEach(function (element, index) {
              if ((first == element.attributes.author.substr(0, 1).toLowerCase()) && (checked != (element.attributes.checked == true))) {
                element.attributes.checked = checked;
                if ((index > offsetIndex) && (index < lastIndex + offsetIndex)) {
                  parent.find("div.item").eq(index - offsetIndex - 1).toggleClass("selected");
                }
              };
            });
          } else if (event.detail > 1) {
            const author = getAuthor(media.attributes.author);
            medias.forEach(function (element, index) {
              if ((author == getAuthor(element.attributes.author)) && (checked != (element.attributes.checked == true))) {
                element.attributes.checked = checked;
                if ((index > offsetIndex) && (index < lastIndex + offsetIndex)) {
                  parent.find("div.item").eq(index - offsetIndex - 1).toggleClass("selected");
                }
              };
            });
          } else if (event.altKey) {
            medias.forEach(function (element, index) {
              if (checked != (element.attributes.checked == true)) {
                element.attributes.checked = checked;
                if ((index > offsetIndex) && (index < lastIndex + offsetIndex)) {
                  parent.find("div.item").eq(index - offsetIndex - 1).toggleClass("selected");
                }
              };
            });
          }
          event.stopPropagation();
          busyMediasCheckboxes = false;
        }).mouseup(function (event) {
          event.stopPropagation();
        }).mousedown(function (event) {
          event.stopPropagation();
        });
      }
    });
    busyMediasCheckboxes = false;
  }

  function createObservers() {
    if (observerMediaPanel == null) {
      observerMediaPanel = createObserver(document.getElementById("media-panel"), {
        attributes: false,
        childList: true,
        subtree: true
      }, function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if ((mutation.type == "childList") && (mutation.target.className == "header no-icon")) {
            createPlaylistButtons();
            break;
          }
        }
        if (busyMediasCheckboxes) {
          return;
        }
        for (let mutation of mutationsList) {
          if ((mutation.type == "childList") && (mutation.target.className.startsWith("row playlist-media-"))) {
            createMediasCheckboxes();
            break;
          }
        }
      });
    }

    if (observerPlaylistMenu == null) {
      observerPlaylistMenu = createObserver(document.getElementById("playlist-menu"), {
        attributes: false,
        childList: true,
        subtree: true
      }, function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if ((mutation.type == "childList") && (mutation.target.className.startsWith("row"))) {
            createPlaylistsCheckboxes();
            break;
          }
        }
      });
    }

    if (observerApp == null) {
      observerApp = createObserver(document.getElementById("app"), {
        attributes: true,
        childList: false,
        subtree: false
      }, function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if ((mutation.type == "attributes") && (mutation.attributeName == "data-theme")) {
          enterRoom(document.location.pathname.replace("/", ""));
            break;
          }
        }
      });
    }

    if (observerDialogContainer == null) {
      observerDialogContainer = createObserver(document.getElementById("dialog-container"), {
        attributes: false,
        childList: true,
        subtree: true
      }, function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if ((mutation.type == "childList") && (mutation.target.id == "dialog-media-update")) {
            createMediaUpdate();
            break;
          }
        }
      });
    }

    if (observerCommunityInfo == null) {
      observerCommunityInfo = createObserver(document.getElementsByClassName("community__meta")[0], {
        attributes: true,
        childList: true,
        subtree: true
      }, function (mutationsList, observer) {
        createTopButtons();
      });
    }
  }

  function refreshPlaylist(id, count) {
    const rows = $("#playlist-menu .menu .container .row");
    const playlists = getPlaylists();
    if (rows.length == playlists.length) {
      const index = playlists.findIndex(element => element.attributes.id == id);
      if (index != -1) {
        const row = rows.eq(index);
        if (count != undefined) {
          row.find("span.count").html("(" + count + ")");
          playlists[index].attributes.count = count;
        }
        if (row.hasClass("selected")) {
          playlists[index].attributes.visible = false;
          row.toggleClass("selected");
          row.mouseup();
        }
      }
    }
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function getPlaylistsIndexes(playlists) {
    let playlistsIndexes = [];

    for (let i = playlists[0].first; i < playlists[playlists.length - 1].last; i++) {
      playlistsIndexes.push(i);
    }
    return playlistsIndexes;
  }

  function getRandomIndexes(randomIndexes, count) {
    let removedIndexes = [];
    while (randomIndexes.length > count) {
      const index = getRandomInt(randomIndexes.length);
      removedIndexes.push(randomIndexes.splice(index, 1)[0]);
    }
    shuffle(randomIndexes);
    return removedIndexes;
  }

  async function fetchPlaylist(id) {
    const response = await fetch("/_/playlists/" + id + "/media");
    const json = await response.json();
    return await json.data;
  }

  function getAuthor(author) {
    author = author.toLowerCase().trim();
    if ((author.length > 3) && ((author.substr(author.length - 3, 1) == "'") || (author.substr(author.length - 3, 1) == "’")) && (author.substr(author.length - 2, 1) >= "0") && (author.substr(author.length - 2, 1) <= "9") && (author.substr(author.length - 1, 1) >= "0") && (author.substr(author.length - 1, 1) <= "9")) {
      author = author.substring(0, author.length - 3).trim();
    }
    author = author.replace(" feat.", "×");
    author = author.split("×")[0];
    return author.trim();
  }

  async function getRandomPlaylist(playlists, randomIndexes, artistCount, maxArtist, cids) {
    let randomPlaylists = [];
    for (let i = 0; i < randomIndexes.length; i++) {
      let index = randomIndexes[i];
      let playlist = playlists.find(element => index < element.last);
      if (!playlist.data) {
        playlist.data = await fetchPlaylist(playlist.id);
      }

      let media = playlist.data[index - playlist.first];
      if (cids.includes(media.cid)) {
        continue;
      }
      if (maxArtist > 0) {
        let author = getAuthor(media.author);
        let count = artistCount[author];
        if (count == undefined) {
          count = 0;
        }
        if (count >= maxArtist) {
          continue;
        }
        artistCount[author] = ++count;
      }
      randomPlaylists.push(media);
    }
    return randomPlaylists;
  }

  async function movePlaylist(id, playlist, beforeId) {
    const ids = {
      ids: playlist.map(element => element.id),
      beforeID: beforeId
    };
    const response = await fetch("/_/playlists/" + id + "/media/move", {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ids)
    });
    const json = await response.json();
    return await json.data;
  }

  async function insertPlaylist(id, ids, append, media) {
    const body = {
      media: (ids != null) ? ids.map(element => element.id) : media,
      append: append
    };
    const response = await fetch("/_/playlists/" + id + "/media/insert", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    if (await json.status != "ok") {
      throw await json.status;
    }
    return await json.data;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function updatePlaylist(id, medias) {
    const wasArray = Array.isArray(medias);
    const data = [];

    if (!wasArray) {
      medias = [medias];
    }

    let count = 0;
    for (media in medias) {
      body = medias[media];
      for (field in body) {
        if (field != "id" && field != "author" && field != "title") {
          delete body[field];
        }
      }
      if ((body.author == "") || (body.title == "")) {
        continue;
      }

      let status = 429;
      let response;
      while (status == 429) {
        if (count++ < 16) {
          response = await fetch("/_/playlists/" + id + "/media/update", {
            method: "PUT",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });
          status = await response.status;
        }
        if (status == 429) {
          count = 0;
          await sleep(15000);
        }
      }
      const json = await response.json();
      data.push(await json.data);
    }

    if (!wasArray) {
      return await data[0];
    } else {
      return await data;
    }
  }

  async function deletePlaylist(id, medias) {
    const ids = {
      ids: medias.map(element => element.id)
    };
    const response = await fetch("/_/playlists/" + id + "/media/delete", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ids)
    });
    const json = await response.json();
    return await json.data;
  }

  async function clearPlaylist(id) {
    return await deletePlaylist(id, getVisiblePlaylistMedias());
  }

  async function skipMe() {
    const response = await fetch("/_/booth/skip/me", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    });
    const json = await response.json();
    return await json.data;
  }

  async function djLeave() {
    const response = await fetch("/_/booth", {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    });
    const json = await response.json();
    return await json.data;
  }

  async function fetchState() {
    const response = await fetch("/_/rooms/state");
    const json = await response.json();
    return await json.data;
  }

  async function changeAvatar(id) {
    id = {
      id: id
    };
    const response = await fetch("/_/users/avatar", {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(id)
    });
    const json = await response.json();
    return await json;
  }

  async function mediaTag(medias) {
  const response = await fetch(`https://script.google.com/macros/s/AKfycbzGVC-_Y9ABtv9g7pxrZeKYl_oJxNX41P7tlxqfmnNZkVbVufa4/exec?idusr=${API.getUser().id}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(medias)
    });
    const json = await response.json();
    return await json;
  }

  function getCids(myHistory, history) {
    let cids = [];
    if (myHistory) {
      cids = getMyHistory().map(element => element.attributes.media.attributes.cid);
    }
    if (history) {
      cids = cids.concat(API.getHistory().map(element => element.media.cid));
    }
    return cids;
  }

  function getVisiblePlaylistMedias() {
    return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && m._events && m._events["change:author"]).models;
  }

  function getCheckedPlaylistMedias() {
    return getVisiblePlaylistMedias().filter(element => element.attributes.checked);
  }

  function getMyHistory() {
    return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && m._events == undefined && typeof m.model === "function" && m.model.prototype.defaults.hasOwnProperty("room")).models;
  }

  function getPlaylists() {
    return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && typeof m.jumpToMedia === 'function').models;
  }

  function getVisiblePlaylist() {
    return getPlaylists().find(element => element.attributes.visible == true);
  }

  function getActivePlaylist() {
    return getPlaylists().find(element => element.attributes.active == true);
  }

  function skipTimerEvent() {
    const media = API.getMedia();
    if (skipAtLeave) {
      if ((API.getDJ().id != API.getUser().id) || (media == undefined) || (media.id != skipAtId)) {
        djLeave();
        skipAtTimer = undefined;
      } else {
        const time = skipAtTime - API.getTimeElapsed();
        if (time <= 0) {
          djLeave();
          skipAtTimer = undefined;
        } else {
          skipAtTimer = setTimeout(skip, time * 1000);
        }
      }
    } else if (API.getDJ().id == API.getUser().id) {
      if ((media != undefined) && (media.id == skipAtId)) {
        const time = skipAtTime - API.getTimeElapsed();
        if (time <= 0) {
          skipMe();
          skipAtTimer = undefined;
        } else {
          skipAtTimer = setTimeout(skipTimerEvent, time * 1000);
        }
      } else {
        skipAtTimer = undefined;
      }
    }
  }

  function rescale() {
    const communityPlayingTop = $(".community__playing-top");
    if (communityPlayingTop.length) {
      if (scale == "") {
        communityPlayingTop.css("overflow", "");
      } else {
        communityPlayingTop.css("overflow", "hidden");
      }
      const ytFrame = $("#yt-frame");
      if (ytFrame.length) {
        if (scale == "") {
          ytFrame.css("transform", "");
        } else {
          ytFrame.css("transform", "scale(" + scale + ")");
        }

        const fullscreenLayer = $("#fullscreen-layer");
        if (fullscreenLayer.length) {
          let height = fullscreenLayer.width() * 9 / 16;
          if (fullscreenLayer.height() > height) {
            ytFrame.css("max-height", height).css("top", ($("#fullscreen-layer").height() - height) / 2).css("max-width", "").css("left", "");
          } else {
            let width = fullscreenLayer.height() * 16 / 9;
            ytFrame.css("max-width", width).css("left", ($("#fullscreen-layer").width() - width) / 2).css("max-height", "").css("top", "");
          }
        }
        $("#yt-watermark").css("right", parseFloat(ytFrame.css("left")) + "px").css("bottom", parseFloat(ytFrame.css("top")) + "px").css("display", (API.getMedia() && API.getMedia().format == 1) ? "block" : "none");
      }
    }
  }

  function advance() {
    advanceMedia(API.getMedia(), true);
  }

  function advanceTimerEvent() {
    advanceMedia(API.getMedia(), false);
  }

  function advanceMedia(media, start) {
    panelNolifeArtist = "";
    panelNolifeTitle = "";
    panelNolifeYear = "";
    panelNolifeLyricistsComposers = "";
    panelNolifeLabels = "";
    panelNolifeStart = undefined;
    panelNolifeDuration1 = undefined;
    panelNolifeEnd = undefined;
    panelNolifeDuration2 = undefined;

    if (skipAtTimer != undefined) {
      clearTimeout(skipAtTimer);
      if (skipAtLeave) {
        djLeave();
      }
      skipAtTimer = undefined;
    }
    skipAtTime = undefined;

    let nextAvatarId = undefined;
    let nextLogoIndex = previousLogoIndex;
    tempLogoIndex = undefined;
    if (media) {
      let title = media.author + "\n" + media.title;

      title = title.replace(/{[^}]*}/g, "");

      if (media.author.trim() == "[Nolife]") {
        tempLogoIndex = nextLogoIndex = 0;
      } else {
        for (let i = 0; i < logoTags.length; i++) {
          let tag = "[" + logoTags[i] + "]";
          if (title.includes(tag)) {
            title = title.replace(tag, "");
            tempLogoIndex = nextLogoIndex = i;
            break;
          }
          if (logoOldN[i] != undefined) {
            tag = "[" + logoTags[i] + "O]";
            if (title.includes(tag)) {
              title = title.replace(tag, "");
              tempLogoIndex = nextLogoIndex = i + logoTags.length;
              break;
            }
          }

          tag = "[" + logoTags[i] + "N]";
          if (title.includes(tag)) {
            title = title.replace(tag, "");
            tempLogoIndex = i;
            nextLogoIndex = 0;
            break;
          }
        }
      }

      let exp, match;

      exp = /.*(\[AVATARS ?)((classic|base|hiphop|rave|country|rock|80s|2014hw|robot|zoo|warrior|island-[ste]|sea-[ste]|diner-[ste]|beach-[ste]|nyc-[ste]|pixel-[ste]|vintage-[ste]|winter-s|zoo-s|warrior-[es]|hiphop-s|robot-s|dragon-e)[0-1][0-9])(\]).*/;
      match = exp.exec(title);
      if ((match != null) && (match.length == 5)) {
        let tag = match[1] + match[2] + match[4];
        nextAvatarId = match[2];
        title = title.replace(tag, "");
      }

      exp = /.*(\[AVATAR ?)((classic|base|hiphop|rave|country|rock|80s|2014hw|robot|zoo|warrior|island-[ste]|sea-[ste]|diner-[ste]|beach-[ste]|nyc-[ste]|pixel-[ste]|vintage-[ste]|winter-s|zoo-s|warrior-[es]|hiphop-s|robot-s|dragon-e)[0-1][0-9])(\]).*/;
      match = exp.exec(title);
      if ((match != null) && (match.length == 5)) {
        let tag = match[1] + match[2] + match[4];
        if (API.getDJ().id == API.getUser().id) {
          nextAvatarId = match[2];
        }
        title = title.replace(tag, "");
      }

      if (nextAvatarId != undefined) {
        if (!hasAvatarToRestore()) {
          previousAvatarId = API.getUser().avatarID;
        }
        changeAvatar(nextAvatarId).then(json => {
          if (json.status == "ok") {
            tempAvatarId = nextAvatarId;
            saveAvatar();
          } else {
            nextAvatarId = undefined;
          }
        });
      }

      exp = /.*(\[SCALE ?)([0-2].[0-9]+)([, ]([0-2].[0-9]+))?(\]).*/;
      match = exp.exec(title);
      if ((match != null) && (match.length == 6)) {
        scale = match[2];
        let tag = match[1] + match[2];
        if (match[4] != undefined) {
          scale += ", " + match[4];
          tag += match[3];
        }
        tag += match[5];
        title = title.replace(tag, "");
        rescale();
      } else {
        scale = "";
        rescale();
      }

      skipAtTime = media.duration + 1;
      let leave = false;

      exp = /.*(\[SKIP ?AT ?)([0-9]+)(:[0-5][0-9])?(:[0-5][0-9])?(\]).*|.*(\[DJLEAVE AFTER\]).*/;
      match = exp.exec(title);
      if ((match != null) && (match.length == 7)) {
        let tag, time;
        if (match[6] != undefined) {
          leave = true;
          tag = match[6];
          time = media.duration - 1.0;
        } else {
          leave = false;
          tag = match[1] + match[2]
          time = parseInt(match[2], 10);
          for (let i = 3; i < 5; i++) {
            if (match[i] != undefined) {
              tag += match[i];
              time = time * 60 + parseInt(match[i].substr(1, 2), 10);
            }
          }
          tag += match[5];
        }

        title = title.replace(tag, "");
        if (time < media.duration) {
          skipAtTime = time;
        }
      }

      if (API.getDJ().id == API.getUser().id) {
        let elapsed = API.getTimeElapsed();
        if (start && elapsed > 0) {

        } else {
          let time = skipAtTime - elapsed;
          skipAtId = media.id;
          skipAtLeave = leave;
          if (time <= 0) {
            skipTimerEvent();
          } else {
            skipAtTimer = setTimeout(skipTimerEvent, time * 1000);
          }
        }
      }

      exp = /.*(\[NL[BT]PC? ?)([1-9][0-9]+)?(\]).*/;
      match = exp.exec(title);
      if ((match != null) && (match.length == 4)) {
        let tag = match[1];
        panelNolifeTop = match[1].substr(3, 1) == "T";
        panelNolifeClassic = match[1].substr(5, 1) == "C";
        panelNolifeRight = match[2];
        if (match[2] != undefined) {
          tag += match[2];
        }
        tag += match[3];
        title = title.replace(tag, "");

        exp = /.*(\[NLD[12]? ?)([1-9]*[0-9](.[0-9]+)?)(\]).*/;
        for (;;) {
          match = exp.exec(title);
          if ((match != null) && (match.length == 5)) {
            let tag = match[1] + match[2];
            if ((match[1].trim() == "[NLD1") || (match[1].trim() == "[NLD")) {
              panelNolifeDuration1 = Math.floor(parseFloat(match[2]) * 25);
            }
            if ((match[1].trim() == "[NLD2") || (match[1].trim() == "[NLD")) {
              panelNolifeDuration2 = Math.floor(parseFloat(match[2]) * 25);
            }
            tag += match[4];
            title = title.replace(tag, "");
          } else {
            break;
          }
        }

        exp = /.*(\[NL[SE] ?)([1-9]*[0-9](.[0-9]+)?)(\]).*/;
        for (;;) {
          match = exp.exec(title);
          if ((match != null) && (match.length == 5)) {
            let tag = match[1] + match[2];
            if (match[1].trim() == "[NLS") {
              panelNolifeStart = Math.floor(parseFloat(match[2]) * 25);
            }
            if (match[1].trim() == "[NLE") {
              panelNolifeEnd = Math.floor(parseFloat(match[2]) * 25);
            }
            tag += match[4];
            title = title.replace(tag, "");
          } else {
            break;
          }
        }

        exp = /.*\[([1-2][901][0-9][0-9] ?)(\(([^()]*(\([^()]*\))*[^()]*)*\))?([^\]]*)?\].*/;
        match = exp.exec(title);
        if ((match != null) && (match.length == 6)) {
          let tag = "[" + match[1];
          panelNolifeYear = match[1].trim();
          if (match[2] != undefined) {
            panelNolifeLyricistsComposers = restoreForbidden(replaceMacrons(replaceEntities(match[2])));
            tag += match[2];
          } else {
            panelNolifeLyricistsComposers = "";
          }
          if (match[5] != undefined) {
            panelNolifeLabels = restoreForbidden(replaceMacrons(replaceEntities(match[5].trim())));
            tag += match[5];
          } else {
            panelNolifeLabels = "";
          }
          tag += "]";
          title = title.replace(tag, "");
        }
        panelNolifeArtist = restoreForbidden(replaceMacrons(replaceEntities(title.split("\n")[0]))).trim();
        panelNolifeTitle = restoreForbidden(replaceMacrons(replaceEntities(title.split("\n")[1]))).trim();
      }
      updateTitle(title, media);
    }

    if (nextAvatarId == undefined) {
      restoreAvatar();
    }
    if (nextLogoIndex != logoIndex) {
      logoIndex = nextLogoIndex;
    }
    panelNolifeUpdate(media);
  }

  function logoRoom(room) {
  return (room == "hummingbird-me") || (room == "nolifebot") || (room == "nolife-tv");
  }

  function enterRoom(room) {
    if (room == null) {
      return;
    }
    if (!logoChanged) {
      if (logoRoom(room) && (logoIndex != 7)) {
        logoIndex = 7;
        previousLogoIndex = 7;
        changeLogo();
      } else if (!logoRoom(room) && (logoIndex != 0)) {
        logoIndex = 0;
        previousLogoIndex = 0;
        changeLogo();
      }
    }
    setTimeout(advanceTimerEvent, 1000);
  }

  function updateTitle(title, media) {
    const author = restoreForbidden(replaceEntities(title.split("\n")[0])).trim();
    const text = restoreForbidden(replaceEntities(title.split("\n")[1])).trim();
    $(".community__song-playing").each(function (index, element) {
      const span = $(this).find("span.author").text(author);
      $(this).text(" - " + text);
      $(this).prepend(span);
      $(this).attr("title", restoreForbidden(replaceEntities(media.author + " - " + media.title)));
    });
  }

  function iconNolife(logoIndex, style, width, height) {
    return `<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${style}><g transform="scale(${width / 320.0})"><path style="fill: ${(logoIndex < logoEdges.length) ? logoEdges[logoIndex] : '#00000000'}" d="M0,22 A22,22,0,0,1,22,0 L118,0 A62,62,0,0,1,168,25 A22,22,0,0,1,190,0 L239,0 A22,22,0,0,1,261,22L261,100 L298,100 A22,22,0,0,1,319,124 L319,170 L320,227 A22,22,0,0,1,298,250 L62,250 A62,62,0,0,1,0,188 Z M85,185 L84,185 L101,227 L102,227 L304 215 L287,173 Z" /><path style="fill: ${(logoIndex < logoLetters.length) ? logoLetters[logoIndex] : '#00000000'}" d="M 85,185 L287,173 L304 215 L102,227 Z M22,31 L116,29 A37,37,0,0,1,153,56 L155,160 L112,161 L110,68 A7,7,0,0,0,102,60 L65,62 L68,178 A7,7,0,0,0,75,185 L85,185 L102,227 L61,228 A37,37,0,0,1,24,192 Z M189,26 L232,25 L234,117 A7,7,0,0,0,241,124 L295,123 L296,155 L228,156 A37,37,0,0,1,192,119Z" /></g><g transform="scale(${width / 90.0})"><path style="fill: ${(logoIndex >= logoEdges.length) ? logoOldN[logoIndex - logoEdges.length] : '#00000000'}" d="M 21.84375,11.28125 C 16.944888,11.386012 13,15.272829 13,21.6875 L 13,61.5 C 13,67.871 18.129,73 24.5,73 l 261,0 0,-8.09375 -256,0 c -3.601,0 -6.5,-2.899 -6.5,-6.5 L 23,26.6875 C 23,23.363033 26.065793,22.616877 28.3125,26 L 45.5,51.90625 C 54.510486,65.474365 67,61.87387 67,48 l 0,-36 -10,0 0,31 c 0,3.835577 -3.236752,4.375503 -5.8125,0.6875 L 33.59375,18.5 c -3.559047,-5.095908 -7.939774,-7.300232 -11.75,-7.21875 z" /></g></svg>`;
  }

  function changeLogo() {
    const path = $(".user-logo svg path");
    path.eq(0).attr("style", "fill: " + ((logoIndex < logoEdges.length) ? logoEdges[logoIndex] : "#00000000"));
    path.eq(1).attr("style", "fill: " + ((logoIndex < logoLetters.length) ? logoLetters[logoIndex] : "#00000000"));
    path.eq(2).attr("style", "fill: " + ((logoIndex >= logoEdges.length) ? logoOldN[logoIndex - logoEdges.length] : "#00000000"));
  }

  function panelNolifeResize() {
    const ytFrame = $("#yt-frame");
    if (ytFrame.length != 0) {
      let logoNolife = $("#logo-nolife");
      if (logoNolife.length != 0) {
        const width = ytFrame.width() * 225 * 900 / (1920 * 800);
        logoNolife.css("transform", "scale(" + width / 900 + ")").css("left", parseFloat(ytFrame.css("left")) + ytFrame.width() * 175 / 1920 + "px").css("top", parseFloat(ytFrame.css("top")) + ytFrame.height() * 80 / 1080 + "px");
      }
      let panelNolife = $("#panel-nolife");
      if (panelNolife.length != 0) {
        panelNolife.css("transform", "scale(" + ytFrame.width() / 1920 + ")").css("left", parseFloat(ytFrame.css("left")) + "px").css("top", parseFloat(ytFrame.css("top")) + "px");
      }
    }
  }

  function panelNolifeUpdate(media) {
    let panelNolife = $("#panel-nolife");
    if (panelNolife.length != 0) {
      panelNolife.remove();
    }
    let logoNolife = $("#logo-nolife");
    if (logoNolife.length != 0) {
      logoNolife.remove();
    }
    if (media && ((logoIndex > 0) || (tempLogoIndex > 0))) {
      const ytFrame = $("#yt-frame");
      if (ytFrame.length == 0) {
        return;
      }

      let duration;
      if ((skipAtTime != undefined) && (skipAtTime < media.duration)) {
        duration = skipAtTime;
      } else {
        duration = media.duration;
      }

      let delay = -API.getTimeElapsed();

    if ((logoIndex > 0) && (previousLogoIndex > 0)) {
        logoNolife = $(`<svg id="logo-nolife" width="900" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="pointer-events: none; position: absolute; z-index: 10; transform-origin: 0 0;"><defs><style type="text/css">@keyframes anim-path-logo-nolife { 0% {transform: scale(0, 1.0); } 100% {transform: scale(1.0, 1.0); }}</style></defs><path style="fill: ${(logoIndex < logoEdges.length) ? logoEdges[logoIndex] : '#00000000'}" d="M0,22 A22,22,0,0,1,22,0 L118,0 A62,62,0,0,1,168,25 A62,62,0,0,1,218,0 L271,0 A62,62,0,0,1,312,16 A22,22,0,0,1,333,0 L382,0 A22,22,0,0,1,404,22 L404,100 L440,100 L440,22 A22,22,0,0,1,462,0 L509,0 A22,22,0,0,1,530,15 A62,26,0,0,1,571,0 L635,0 A37,37,0,0,1,661,12 A62,62,0,0,1,697,0 L767,0 A22,22,0,0,1,789,22 L789,61 A22,22,0,0,1,778,81 L778,105 A22,22,0,0,1,789,124 L789,170 L800,227 A22,22,0,0,1,778,250 L62,250 A62,62,0,0,1,0,188 Z M85,185 L84,185 L101,227 L102,227 L774 215 L757,173 Z"/><path style="fill: ${(logoIndex < logoLetters.length) ? logoLetters[logoIndex] : '#00000000'}" d=""/><path style="fill: ${(logoIndex < logoLetters.length) ? logoLetters[logoIndex] : '#00000000'}" d="M22,31 L116,29 A37,37,0,0,1,153,56 L155,160 L112,161 L110,68 A7,7,0,0,0,102,60 L65,62 L68,178 A7,7,0,0,0,75,185 L85,185 L102,227 L61,228 A37,37,0,0,1,24,192 Z M176,65 A37,37,0,0,1,213,28 L269,27 A37,37,0,0,1,306,64 L307,121 A37,37,0,0,1,270,158 L214,159 A37,37,0,0,1,177,122 Z M227,60 A7,7,0,0,0,220,67 L220 120 A7,7,0,0,0,227,127 L256,126 A7,7,0,0,0,263,119 L262,66 A7,7,0,0,0,255,59 Z M332,26 L375,25 L377,117 A7,7,0,0,0,384,124 L438,123 L439,155 L371,156 A37,37,0,0,1,334,119Z M463,24 L503,23 L505,153 L465,154 Z M530,59 A37,37,0,0,1,567,22 L633,21 L634,52 L580,53 A7,7,0,0,0,573,60 L573,71 L623,70 L624,102 L574,103 L575,152 L531,153Z M656,57 A37,37,0,0,1,693,20 L760,19 L761,50 L706,51 A7,7,0,0,0,699,58 L699,69 L749,68 L750,99 L700,100 L700,111 A7,7,0,0,0,707,118 L761,117 L762,149 L694,150 A37,37,0,0,1,657,113 Z"/><path style="fill: ${(logoIndex >= logoLetters.length) ? logoOldN[logoIndex - logoEdges.length] : '#00000000'}" d="M 27,1 C 12,1 0,13 0,35 L 0,152 C 0,171 15,186 35,186 l 23,0 0,-24 -8,0 c -11,0 -20,-9 -20,-20 L 30,47 C 30,37 39,35 46,45 L 98,123 C 125,163 162,153 162,111 l 0,-108 -30,0 0,93 c 0,12 -10,13 -17,2 L 62,23 c -11,-15 -24,-22 -35,-22 z"/><path style="animation: anim-path-logo-nolife ${duration}s linear ${delay}s 1 normal both; transform-origin: 58px 162px; fill: ${(logoIndex >= logoLetters.length) ? logoOldN[logoIndex - logoEdges.length] : '#00000000'}" d="m 58,162 0,24 760,0 0,-24 -760,0 z"/><path style="fill: ${(logoIndex >= logoLetters.length) ? logoOldOLIFE[logoIndex - logoEdges.length] : '#00000000'}" d="M 215,33 C 195,33 180,48 180,68 l 0,42 C 180,129 195,144 215,144 l 87,0 c 19,0 35,-15 35,-35 l 0,-42 C 336,48 321,33 302,33 l -87,0 z m 15,24 57,0 c 11,0 20,9 20,20 l 0,24 c 0,11 -9,20 -20,20 l -57,0 c -11,0 -20,-9 -20,-20 l 0,-24 c 0,-11 9,-20 20,-20 z M 353,33 m 0,77 c 0,19 15,35 35,35 l 92,0 0,-24 -77,0 c -11,0 -20,-9 -20,-20 L 383,33 l -30,0 z M 497,33 m 0,111 30,0 0,-111 -30,0 z M 582,33 c -19,0 -35,15 -35,35 l 0,77 30,0 0,-45 96,0 0,-24 -96,0 c 1,-10 9,-18 19,-18 l 77,0 L 674,33 582,33 z M 726,33 c -19,0 -35,15 -35,35 l 0,42 c 0,19 15,35 35,35 l 92,0 0,-24 -77,0 c -11,0 -20,-9 -20,-20 l 0,-2 96,0 0,-24 -96,0 c 1,-10 9,-18 19,-18 l 77,0 L 818,33 726,33 z"/></svg>`);
        ytFrame.before(logoNolife);
      }
    if ((panelNolifeArtist != "") && (panelNolifeTitle != "") && (previousLogoIndex > 0) && ((logoIndex > 0) || (tempLogoIndex > 0))) {
      let regex = /[\u3000-\u300B]|[\u300E-\u301B]|[\u301D-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|\u203B/g;
        if (!regex.test(panelNolifeArtist + panelNolifeTitle + panelNolifeLyricistsComposers + panelNolifeLabels)) {
          let right;
          let margin;
          let finalRight;
          if (panelNolifeTop) {
            right = 175;
            margin = 76;
            position = "top";
          } else {
            right = 250;
            margin = 902;
            position = "bottom";
          }

          if (panelNolifeRight != undefined) {
            finalRight = panelNolifeRight;
          } else {
            finalRight = right;
          }

          const svg = $('<svg width="1920" height="1080" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g class="panel-nolife"><text class="title-nolife" x="1920" y="30" text-anchor="end"/><text class="artist-nolife back-nolife" x="1920" y="62" text-anchor="end"/><text class="artist-nolife front-nolife" x="1920" y="62" text-anchor="end"/></g>');
          svg.find(".title-nolife").text(panelNolifeTitle);
          svg.find(".artist-nolife").text(panelNolifeArtist);
          $("body").append(svg);
          const width = svg.find("g")[0].getBoundingClientRect().width;
          let scale = 1.0;
          if (width > 310) {
            scale = 310 / width;
          }
          svg.remove();

          let start = end = 99;
          let duration1 = duration2 = 201;

          if (panelNolifeStart != undefined) {
            start = panelNolifeStart;
          }
          if (panelNolifeDuration1 != undefined) {
            duration1 = panelNolifeDuration1;
          }
          if (panelNolifeDuration2 != undefined) {
            duration2 = panelNolifeDuration2;
          }
          if (panelNolifeEnd != undefined) {
            end = panelNolifeEnd;
          }

          const dur1 = (start + duration1 + 132) * 40;
          const dur2 = (end + duration2 + 132) * 40;

          const delay1 = -API.getTimeElapsed() * 1000;
          const delay2 = (-API.getTimeElapsed() + duration) * 1000 - dur2;
          let classIndex = logoIndex;
          if (classIndex == 0) {
            classIndex = tempLogoIndex;
          }
          const svgClass = logoClasses[classIndex % logoClasses.length];
          const classic = ((svgClass == "jm") && panelNolifeClassic) ? "visible" : "hidden";

          panelNolife = $(`<svg id="panel-nolife" class="${svgClass}" width="1920" height="1080" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="pointer-events: none; position: absolute; z-index: 10; transform-origin: 0 0;"><defs><style type="text/css"> @keyframes anim-circle-stroke-nolife-1 { 0% {stroke-dasharray: 0 710; visibility: hidden; transform: scale(-0.5, 0.5) rotate(-90deg); } ${((start+8)/(start+duration1+132)*100).toFixed(2)}% {stroke-dasharray: 0 710; visibility: hidden; transform: scale(-0.5, 0.5) rotate(-90deg); } ${((start+16)/(start+duration1+132)*100).toFixed(2)}% {stroke-dasharray: 710 710; visibility: visible; transform: scale(-1.0, 1.0) rotate(-90deg); } 100% {stroke-dasharray: 710 710; visibility: visible; transform: scale(-1.0, 1.0) rotate(-90deg); }} @keyframes anim-circle-stroke-nolife-2 { 0% {stroke-dasharray: 710 710; visibility: visible; transform: scale(-1.0, 1.0) rotate(-90deg); } ${(100-(end+16)/(end+duration2+132)*100).toFixed(2)}% {stroke-dasharray: 710 710; visibility: visible; transform: scale(-1.0, 1.0) rotate(-90deg); } ${(100-(end+8)/(end+duration2+132)*100).toFixed(2)}% {stroke-dasharray: 0 710; visibility: hidden; transform: scale(-0.5, 0.5) rotate(-90deg); } 100% {stroke-dasharray: 0 710; visibility: hidden; transform: scale(-0.5, 0.5) rotate(-90deg); }} @keyframes anim-circle-fill-nolife-1 { 0% {transform: scale(0, 0); opacity: 0; } ${((start+16)/(start+duration1+132)*100).toFixed(2)}% {transform: scale(0, 0); opacity: 0; } ${((start+22)/(start+duration1+132)*100).toFixed(2)}% {transform: scale(1, 1); opacity: 1; } 100% {transform: scale(1, 1); opacity: 1; }} @keyframes anim-circle-fill-nolife-2 { 0% {transform: scale(1, 1); opacity: 1; } ${(100-(end+22)/(end+duration2+132)*100).toFixed(2)}% {transform: scale(1, 1); opacity: 1; } ${(100-(end+16)/(end+duration2+132)*100).toFixed(2)}% {transform: scale(0, 0); opacity: 0; } 100% {transform: scale(0, 0); opacity: 0; }} @keyframes anim-g-top-block-nolife-1 { 0% {opacity: 0; transform: translate(10px, 0); } ${(start/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(10px, 0); } ${((start+8)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${((start+22)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${((start+26)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(-28px, -66px); } ${((start+30)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(-26px, -59px); } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(-26px, -59px); } ${((start+duration1+56)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${((start+duration1+58)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; transform: translate(0, 0); } 100% {opacity: 0; transform: translate(0, 0); }} @keyframes anim-g-top-block-nolife-2 { 0% {opacity: 0; transform: translate(0, 0); } ${(100-(end+duration2+58)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; transform: translate(0, 0); } ${(100-(end+duration2+56)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(-26px, -59px); } ${(100-(end+30)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(-26px, -59px); } ${(100-(end+26)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(-28px, -66px); } ${(100-(end+22)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${(100-(end+8)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${(100-end/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(10px, 0); } 100% {opacity: 0; transform: translate(10px, 0); }} @keyframes anim-g-bottom-block-nolife-1 { 0% {opacity: 0; transform: translate(10px, 0); } ${(start/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(10px, 0); } ${((start+8)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${((start+22)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${((start+26)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(28px, 66px); } ${((start+30)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(26px, 59px); } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(26px, 59px); } ${((start+duration1+56)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${((start+duration1+58)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; transform: translate(0, 0); } 100% {opacity: 0; transform: translate(0, 0); }} @keyframes anim-g-bottom-block-nolife-2 { 0% {opacity: 0; transform: translate(0, 0); } ${(100-(end+duration2+58)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; transform: translate(0, 0); } ${(100-(end+duration2+56)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(26px, 59px); } ${(100-(end+30)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(26px, 59px); } ${(100-(end+26)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(28px, 66px); } ${(100-(end+22)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${(100-(end+8)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0); } ${(100-end/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(10px, 0); } 100% {opacity: 0; transform: translate(10px, 0); }} @keyframes anim-g-text-nolife-1 { 0% {opacity: 0; } ${((start+26)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; } ${((start+38)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; } ${((start+duration1+38)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; } ${((start+duration1+43)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; } 100% {opacity: 0; }} @keyframes anim-g-text-nolife-2 { 0% {opacity: 0; } ${(100-(end+duration2+43)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; } ${(100-(end+duration2+38)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; } ${(100-(end+38)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; } ${(100-(end+26)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; } 100% {opacity: 0; }} @keyframes anim-path-background-nolife-1 { 0% {opacity: 0; } ${((start+26)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; } ${((start+38)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; } ${((start+duration1+43)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; } 100% {opacity: 0; }} @keyframes anim-path-background-nolife-2 { 0% {opacity: 0; } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; } ${(100-(end+duration2+43)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; } ${(100-(end+38)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; } ${(100-(end+26)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; } 100% {opacity: 0; }} @keyframes anim-image-note-nolife-1 { 0% {opacity: 0; } ${((start+30)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; } ${((start+38)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; } ${((start+duration1+43)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; } 100% {opacity: 0; }} @keyframes anim-image-note-nolife-2 { 0% {opacity: 0; } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; } ${(100-(end+duration2+43)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; } ${(100-(end+38)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; } ${(100-(end+30)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; } 100% {opacity: 0; }} @keyframes anim-circle-move-bottom-nolife-1 { 0% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); } ${((start+duration1+58)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); } ${((start+duration1+75)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(958px, 81px) scale(0.3, 0.3); } ${((start+duration1+88)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(958px, 81px) scale(0.3, 0.3); } ${((start+duration1+119)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; transform: translate(958px, 81px) scale(0.3, 0.3); } 100% {opacity: 0; transform: translate(958px, 81px) scale(0.3, 0.3); }} @keyframes anim-circle-move-bottom-nolife-2 { 0% {opacity: 0; transform: translate(958px, 81px) scale(0.3, 0.3); } ${(100-(end+duration2+119)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; transform: translate(958px, 81px) scale(0.3, 0.3); } ${(100-(end+duration2+88)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(958px, 81px) scale(0.3, 0.3); } ${(100-(end+duration2+70)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(958px, 81px) scale(0.3, 0.3); } ${(100-(end+duration2+58)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); } 100% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); }} @keyframes anim-circle-move-top-nolife-1 { 0% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); } ${((start+duration1+58)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); } ${((start+duration1+60)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(216px, 14px) scale(0.9, 0.9); } ${((start+duration1+62)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(453px, 30px) scale(0.8, 0.8); } ${((start+duration1+64)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(649px, 11px) scale(0.7, 0.7); } ${((start+duration1+66)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(804px, -59px) scale(0.6, 0.6); } ${((start+duration1+68)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(913px, -159px) scale(0.5, 0.5); } ${((start+duration1+70)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(982px, -278px) scale(0.4, 0.4); } ${((start+duration1+75)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(1002px, -408px) scale(0.3, 0.3); } ${((start+duration1+84)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(1036px, -748px) scale(0.3, 0.3); } ${((start+duration1+88)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: translate(1036px, -748px) scale(0.3, 0.3); } ${((start+duration1+119)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; transform: translate(1036px, -748px) scale(0.3, 0.3); } 100% {opacity: 0; transform: translate(1036px, -748px) scale(0.3, 0.3); }} @keyframes anim-circle-move-top-nolife-2 { 0% {opacity: 0; transform: translate(1036px, -748px) scale(0.3, 0.3); } ${(100-(end+duration2+119)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; transform: translate(1036px, -748px) scale(0.3, 0.3); } ${(100-(end+duration2+88)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(1036px, -748px) scale(0.3, 0.3); } ${(100-(end+duration2+84)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(1036px, -748px) scale(0.3, 0.3); } ${(100-(end+duration2+75)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(1002px, -408px) scale(0.3, 0.3); } ${(100-(end+duration2+70)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(982px, -278px) scale(0.4, 0.4); } ${(100-(end+duration2+68)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(913px, -159px) scale(0.5, 0.5); } ${(100-(end+duration2+66)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(804px, -59px) scale(0.6, 0.6); } ${(100-(end+duration2+64)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(649px, 11px) scale(0.7, 0.7); } ${(100-(end+duration2+62)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(453px, 30px) scale(0.8, 0.8); } ${(100-(end+duration2+60)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(216px, 14px) scale(0.9, 0.9); } ${(100-(end+duration2+58)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); } 100% {opacity: 1; transform: translate(0, 0) scale(1.0, 1.0); }} @keyframes anim-circle-stroke2-nolife-1 { 0% {visibility: hidden; } ${((start+duration1+75)/(start+duration1+132)*100).toFixed(2)}% {visibility: hidden; } ${((start+duration1+84)/(start+duration1+132)*100).toFixed(2)}% {visibility: visible; } 100% {visibility: visible; }} @keyframes anim-circle-stroke2-nolife-2 { 0% {visibility: visible; } ${(100-(end+duration2+84)/(end+duration2+132)*100).toFixed(2)}% {visibility: visible; } ${(100-(end+duration2+75)/(end+duration2+132)*100).toFixed(2)}% {visibility: hidden; } 100% {visibility: hidden; }} @keyframes anim-image-note2-nolife-1 { 0% {opacity: 0; transform: scale(0, 0); } ${((start+duration1+70)/(start+duration1+132)*100).toFixed(2)}% {opacity: 0; transform: scale(0, 0); } ${((start+duration1+80)/(start+duration1+132)*100).toFixed(2)}% {transform: scale(4.0, 4.0); } ${((start+duration1+84)/(start+duration1+132)*100).toFixed(2)}% {opacity: 1; transform: scale(3.4, 3.4); } 100% {opacity: 1; transform: scale(3.4, 3.4); }} @keyframes anim-image-note2-nolife-2 { 0% {opacity: 1; transform: scale(3.4, 3.4); } ${(100-(end+duration2+84)/(end+duration2+132)*100).toFixed(2)}% {opacity: 1; transform: scale(3.4, 3.4); } ${(100-(end+duration2+80)/(end+duration2+132)*100).toFixed(2)}% {transform: scale(4.0, 4.0); } ${(100-(end+duration2+70)/(end+duration2+132)*100).toFixed(2)}% {opacity: 0; transform: scale(0, 0); } 100% {opacity: 0; transform: scale(0, 0); }} @keyframes anim-g-panel-nolife-1 { 0% {visibility: hidden; transform: translate(-${right}px, ${margin}px) scale(${scale}, 1.0); } ${((start+duration1+94)/(start+duration1+132)*100).toFixed(2)}% {visibility: hidden; transform: translate(-${right}px, ${margin}px) scale(${scale}, 1.0); } ${((start+duration1+119)/(start+duration1+132)*100).toFixed(2)}% {visibility: visible; transform: translate(-${right}px, ${margin}px) scale(${scale}, 1.0); } 100% {visibility: visible; transform: translate(-${finalRight}px, ${margin}px) scale(1.0, 1.0); } 100% {visibility: visible; transform: translate(-${finalRight}px, ${margin}px) scale(1.0, 1.0); }} @keyframes anim-g-panel-nolife-2 { 0% {visibility: visible; transform: translate(-${finalRight}px, ${margin}px) scale(1.0, 1.0); } 0% {visibility: visible; transform: translate(-${finalRight}px, ${margin}px) scale(1.0, 1.0); } ${(100-(end+duration2+119)/(end+duration2+132)*100).toFixed(2)}% {visibility: visible; transform: translate(-${right}px, ${margin}px) scale(${scale}, 1.0); } ${(100-(end+duration2+94)/(end+duration2+132)*100).toFixed(2)}% {visibility: hidden; transform: translate(-${right}px, ${margin}px) scale(${scale}, 1.0); } 100% {visibility: hidden; transform: translate(-${right}px, ${margin}px) scale(${scale}, 1.0); }} @keyframes anim-stop-1-fade1-gradient-1 { 0% { opacity: 0.98; } ${(start/(start+duration1+132)*100).toFixed(2)}% { opacity: 0.98; } ${((start+8)/(start+duration1+132)*100).toFixed(2)}% { opacity: -0.02; } 100% { opacity: -0.02; }} @keyframes anim-stop-1-fade1-gradient-2 { 0% { opacity: -0.02; } ${(100-(end+8)/(end+duration2+132)*100).toFixed(2)}% { opacity: -0.02; } ${(100-end/(end+duration2+132)*100).toFixed(2)}% { opacity: 0.98; } 100% { opacity: 0.98; }} @keyframes anim-stop-2-fade1-gradient-1 { 0% { opacity: 1; } ${(start/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } ${((start+8)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-2-fade1-gradient-2 { 0% { opacity: 0; } ${(100-(end+8)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } ${(100-end/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } 100% { opacity: 1; }} @keyframes anim-stop-1-fade2-gradient-1 { 0% { opacity: 0; } ${((start+16)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } ${((start+26)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } ${((start+duration1+43)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-1-fade2-gradient-2 { 0% { opacity: 0; } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } ${(100-(end+duration2+43)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } ${(100-(end+26)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } ${(100-(end+16)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-2-fade2-gradient-1 { 0% { opacity: 0.02; } ${((start+16)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0.02; } ${((start+26)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1.02; } ${((start+duration1+43)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1.02; } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0.02; } 100% { opacity: 0.02; }} @keyframes anim-stop-2-fade2-gradient-2 { 0% { opacity: 0.02; } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0.02; } ${(100-(end+duration2+43)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1.02; } ${(100-(end+26)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1.02; } ${(100-(end+16)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0.02; } 100% { opacity: 0.02; }} @keyframes anim-stop-1-fade3-gradient-1 { 0% { opacity: 0; } ${((start+30)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } ${((start+38)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } ${((start+duration1+43)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-1-fade3-gradient-2 { 0% { opacity: 0; } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } ${(100-(end+duration2+43)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } ${(100-(end+38)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } ${(100-(end+30)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-2-fade3-gradient-1 { 0% { opacity: 0.02; } ${((start+30)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0.02; } ${((start+38)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1.02; } ${((start+duration1+43)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1.02; } ${((start+duration1+51)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0.02; } 100% { opacity: 0.02; }} @keyframes anim-stop-2-fade3-gradient-2 { 0% { opacity: 0.02; } ${(100-(end+duration2+51)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0.02; } ${(100-(end+duration2+43)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1.02; } ${(100-(end+38)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1.02; } ${(100-(end+30)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0.02; } 100% { opacity: 0.02; }} @keyframes anim-stop-1-fade4-gradient-1 { 0% { opacity: -0.02; } ${((start+duration1+56)/(start+duration1+132)*100).toFixed(2)}% { opacity: -0.02; } ${((start+duration1+58)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0.98; } 100% { opacity: 0.98; }} @keyframes anim-stop-1-fade4-gradient-2 { 0% { opacity: 0.98; } ${(100-(end+duration2+58)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0.98; } ${(100-(end+duration2+56)/(end+duration2+132)*100).toFixed(2)}% { opacity: -0.02; } 100% { opacity: -0.02; }} @keyframes anim-stop-2-fade4-gradient-1 { 0% { opacity: 0; } ${((start+duration1+56)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } ${((start+duration1+58)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } 100% { opacity: 1; }} @keyframes anim-stop-2-fade4-gradient-2 { 0% { opacity: 1; } ${(100-(end+duration2+58)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } ${(100-(end+duration2+56)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-1-fade5-gradient-1 { 0% { opacity: 0; } ${((start+duration1+75)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } ${((start+duration1+84)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } 100% { opacity: 1; }} @keyframes anim-stop-1-fade5-gradient-2 { 0% { opacity: 1; } ${(100-(end+duration2+84)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } ${(100-(end+duration2+75)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-2-fade5-gradient-1 { 0% { opacity: 0.02; } ${((start+duration1+75)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0.02; } ${((start+duration1+84)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1.02; } 100% { opacity: 1.02; }} @keyframes anim-stop-2-fade5-gradient-2 { 0% { opacity: 1.02; } ${(100-(end+duration2+84)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1.02; } ${(100-(end+duration2+75)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0.02; } 100% { opacity: 0.02; }} @keyframes anim-stop-1-fill-vertical-gradient-1 { 0% { opacity: 1; } ${((start+duration1+84)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1; } ${((start+duration1+88)/(start+duration1+132)*100).toFixed(2)}% { opacity: -0.02; } 100% { opacity: -0.02; }} @keyframes anim-stop-1-fill-vertical-gradient-2 { 0% { opacity: -0.02; } ${(100-(end+duration2+88)/(end+duration2+132)*100).toFixed(2)}% { opacity: -0.02; } ${(100-(end+duration2+84)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1; } 100% { opacity: 1; }} @keyframes anim-stop-2-fill-vertical-gradient-1 { 0% { opacity: 1.02; } ${((start+duration1+84)/(start+duration1+132)*100).toFixed(2)}% { opacity: 1.02; } ${((start+duration1+88)/(start+duration1+132)*100).toFixed(2)}% { opacity: 0; } 100% { opacity: 0; }} @keyframes anim-stop-2-fill-vertical-gradient-2 { 0% { opacity: 0; } ${(100-(end+duration2+88)/(end+duration2+132)*100).toFixed(2)}% { opacity: 0; } ${(100-(end+duration2+84)/(end+duration2+132)*100).toFixed(2)}% { opacity: 1.02; } 100% { opacity: 1.02; }}</style><radialGradient id="red-radial-gradient"><stop offset="0%" stop-color="#96454A"/><stop offset="100%" stop-color="#D56F76"/></radialGradient><radialGradient id="yellow-radial-gradient"><stop offset="0%" stop-color="#7D5E10"/><stop offset="100%" stop-color="#B59032"/></radialGradient><radialGradient id="green-radial-gradient"><stop offset="0%" stop-color="#6D8F65"/><stop offset="100%" stop-color="#B5CBB0"/></radialGradient><radialGradient id="blue-radial-gradient"><stop offset="0%" stop-color="#174965"/><stop offset="100%" stop-color="#387AAC"/></radialGradient><radialGradient id="white-radial-gradient"><stop offset="0%" stop-color="#7D7D7D"/><stop offset="100%" stop-color="#B5B5B5"/></radialGradient><linearGradient id="red-vertical-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#B13A3E" offset="0%"/><stop stop-color="#DE747A" offset="100%"/></linearGradient><linearGradient id="yellow-vertical-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#A86F01" offset="0%"/><stop stop-color="#CCA028" offset="100%"/></linearGradient><linearGradient id="green-vertical-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#70AF53" offset="0%"/><stop stop-color="#9BDDA0" offset="100%"/></linearGradient><linearGradient id="blue-vertical-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#2F75AD" offset="0%"/><stop stop-color="#8BBDC6" offset="100%"/></linearGradient><linearGradient id="classic-red-vertical-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#A52B30" offset="0%"/><stop stop-color="#D7565B" offset="100%"/></linearGradient><linearGradient id="white-vertical-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#A8A8A8" offset="0%"/><stop stop-color="#CCCCCC" offset="100%"/></linearGradient><linearGradient id="background-gradient"><stop stop-color="#FFFFFF10" offset="0%"/><stop stop-color="#FFFFFFB5" offset="3.5%"/><stop stop-color="#FFFFFFB5" offset="100%"/></linearGradient><linearGradient id="classic-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#FFE3BC" offset="15%"/><stop stop-color="#FFFFFF" offset="50%"/><stop stop-color="#E28951" offset="95%"/></linearGradient><linearGradient id="fade1-gradient"><stop stop-color="#000000" offset="0%"/><stop stop-color="#000000" style="animation: anim-stop-1-fade1-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-1-fade1-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#FFFFFF" style="animation: anim-stop-2-fade1-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-2-fade1-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#FFFFFF" offset="100%"/></linearGradient><linearGradient id="fade2-gradient"><stop stop-color="#FFFFFF" offset="0%"/><stop stop-color="#FFFFFF" style="animation: anim-stop-1-fade2-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-1-fade2-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#000000" style="animation: anim-stop-2-fade2-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-2-fade2-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#000000" offset="100%"/></linearGradient><linearGradient id="fade3-gradient"><stop stop-color="#FFFFFF" offset="0%"/><stop stop-color="#FFFFFF" style="animation: anim-stop-1-fade3-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-1-fade3-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#000000" style="animation: anim-stop-2-fade3-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-2-fade3-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#000000" offset="100%"/></linearGradient><linearGradient id="fade4-gradient"><stop stop-color="#000000" offset="0%"/><stop stop-color="#000000" style="animation: anim-stop-1-fade4-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-1-fade4-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#FFFFFF" style="animation: anim-stop-2-fade4-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-2-fade4-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#FFFFFF" offset="100%"/></linearGradient><linearGradient id="fade5-gradient"><stop stop-color="#FFFFFF" offset="0%"/><stop stop-color="#FFFFFF" style="animation: anim-stop-1-fade5-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-1-fade5-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#000000" style="animation: anim-stop-2-fade5-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-2-fade5-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#000000" offset="100%"/></linearGradient><linearGradient id="fill-vertical-gradient" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#FFFFFF00" offset="0%"/><stop stop-color="#FFFFFF00" style="animation: anim-stop-1-fill-vertical-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-1-fill-vertical-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/><stop stop-color="#FFFFFFB5" style="animation: anim-stop-2-fill-vertical-gradient-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-stop-2-fill-vertical-gradient-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;"/></linearGradient><mask id="fade1-nolife" x="0" y="0" width="1960" height="1080" maskUnits="userSpaceOnUse"><rect width="1960" height="1080" x="0" y="0" fill="url(#fade1-gradient)"/></mask><mask id="fade2-nolife" x="0" y="0" width="1377" height="73"><rect width="1377" height="73" x="322" y="908" fill="url(#fade2-gradient)"/></mask><mask id="fade3-nolife" x="0" y="0" width="1269" height="56"><rect width="1269" height="56" x="296" y="788" fill="url(#fade3-gradient)"/></mask><mask id="fade4-nolife" x="-27" y="0" width="1974" height="1080" maskUnits="userSpaceOnUse"><rect width="1974" height="1080" x="-27" y="0" fill="url(#fade4-gradient)"/></mask><mask id="fade5-nolife" x="0" y="0" width="1920" height="1080" maskUnits="userSpaceOnUse"><rect width="1920" height="1080" x="0" y="0" fill="url(#fade5-gradient)"/></mask><filter id="blur-filter"><feGaussianBlur in="SourceGraphic" stdDeviation="1"/></filter><filter id="blur-filter2"><feGaussianBlur in="SourceGraphic" stdDeviation="3"/></filter></defs><g class="big-panel-nolife" style="animation: anim-g-big-panel-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-g-big-panel-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards;" mask="url(#fade1-nolife)"><g style="animation: anim-circle-move-${position}-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-circle-move-${position}-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 354px 858px;"><rect class="stroke2-nolife" style="animation: anim-circle-stroke2-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-circle-stroke2-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 355px 859px;" x="250" y="754" width="1376" rx="105" ry="105" height="210" fill="url(#fill-vertical-gradient)" mask="url(#fade5-nolife)"/><circle class="stroke-nolife" style="animation: anim-circle-stroke-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-circle-stroke-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 354px 858px;" filter="url(#blur-filter)" cx="354" cy="858" r="113" fill="none" stroke-width="15" stroke-linecap="round"/><circle class="fill-nolife" style="animation: anim-circle-fill-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-circle-fill-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 354px 858px;" filter="url(#blur-filter)" cx="354" cy="858" r="106"/><rect class="stroke-nolife" style="animation: anim-circle-stroke2-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-circle-stroke2-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 354px 858px;" filter="url(#blur-filter2)" x="241" y="745" width="1376" rx="105" ry="105" height="210" fill="none" stroke-width="15" mask="url(#fade5-nolife)"/><circle class="stroke2-nolife" style="animation: anim-circle-stroke2-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-circle-stroke2-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 355px 859px;" filter="url(#blur-filter2)" cx="355" cy="859" r="105" fill="none" stroke-width="30"/><rect class="stroke2-nolife" style="animation: anim-circle-stroke2-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-circle-stroke2-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 355px 859px;" filter="url(#blur-filter2)" x="250" y="754" width="1376" rx="105" ry="105" height="210" fill="none" stroke-width="25" mask="url(#fade5-nolife)"/><image style="animation: anim-image-note2-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-image-note2-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 354px 858px;" x="332" y="836" width="44" height="44" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAACXBIWXMAAAsSAAALEgHS3X78AAAJdUlEQVR42rWZfUyV5xnG7T5IV9pmrqlrm5m2abPNNts6szbapUuXbanbNDIzoRZUEkQExAGK+IGKWhHwkwnKFCVUcIooiFK1GlGpil9YB6ITBeXTQbaaSVTk49l1Pbne5fQIChz6xy8cj4fz/t77vZ/7vp+HQcaYQQPIKBAIksHqbsjt6urqFv6fPhMNxvd0jYGUHQl8cfFlYBvY3o3YycfAzzxS2mNRXIAMB2NAHMgAR8CJboTqHsP/pUE0GM/vHzBhyb4JRoJYkA4OgqvgprtQQ0ODcWhsbLTcunXL/uR7vZH2VHaIousHEkEe+KK6uroVdNbX15vr16+b2tpag3+by5cvf4UrV65Yrl27Zv+/pqamR2mPhF1kh4KxIARsBEdLSkqajhw5cg8YvDYXLlwwZWVl5ujRo2bv3r1m3759D3Ho0CFz+vRp+1neYHfSTk73V7ZH4W3btjVlZWXdAwavzZ49e8yuXbvMpk2bzMqVKx8iOTnZpKam2s8WFBT0KO0sxAEXXrNmTdOcOXPuRUVFmSVLlph169aZjRs3ms2bN5u0tDSzfPlys2zZMhMfH2/i4uJMRESEiY2NNUlJSfazjHRlZSWFG8AZsAuk4NoxwG+ghCNBJoUTExObZsyYcW/y5MkmJCTEylCc0WQkFy1aZEXnzZtn5s6da0JDQ01kZKR9b+nSpWb37t1Mn3Z8Vz04D/aANFw7FvzJE+GXwTDwEZgLPgGleMS3Idru4+NjfH19rTSjPX/+fBtFSlKWggsXLrSvCV/jZtpTUlLa8vPzW1VlHOFUXDsUjPNE+FXwFvAH88EOUIbHehtR6xgzZowJCAgwwcHBVnr69OkGqWJFmQ5MC94Acxh04HU7ns6dzMzMVuXvP8AhPTlGdzJ4zRPh18E7IBAkgHxQsXbt2gdhYWFm1KhRZvTo0cbPz88EBgbax87oMjW2bNliF2JxcXEnqkkHaMXrO/j9WsmelWyOghGMa48Ab3oa4XdBkErPZ6Aai86Eh4ebsWPH2pSgPCPLSHLRsYydPHnSLizU4Hb8vI/fuyFOS/aAqkM8CAcf4NrDwRBPhX8JQsEqcJjRWb16tcGiM5MmTbLijCgrxMGDB82ZM2dsybp586ZTtpinNRJlRfhUshluspxThoLnPRFmhRihL03X/FC9atUqEx0dbaZOnWpiYmLs42ctrqiosO23ubnZtcY6cGHtA3+TbHR3sp42jhfAz0EASAb7KcyIUnjmzJkG+Wy72MWLF01dXZ2dGdwaQp5+pummIyUb0J2sp8KDNfj4uwtTlnm7fv16c/z4cTs39DAnrNXPCPAX4Ku5ZGR3sn0Wlqg3+A74iRZduC7K3KtesWKFmTVrlm0QbM8U5gJT93IXjtEa+LOmMj6xdyT6kOzjhJ8A33CR9Rava8H9Gvxej3CNxkorzNxld8vJybEV4dKlSz1NYXw6H4JXwA/Bi7jWy+BF0esB/lviSeAl0WfBTzX78iLByrkE5R/rZjXLFyPcB2FvpdcLiuhzj3rK3b35TeANniX4oufAa5p7x2nQYTH/GKxUHm5VWatxFz5x4sSjhMcrvZ7WNR+blu5vfBsMFkM1K7D9vqcFEa0FtkEtk/u2nRx6QAnrqntK9EKY6ebV23XkHtnBSvYfaVH9CvxBCytOI+TfVTO5yD7X3u2sOlUtq8Ts2bO/ItzDgnMVHtQf4SFK+J9pRvBRPYzRo/9EecqLfgEuqlPdcPZsnGUp7B7hr0OYyf4KeBu//FuJRmifxu6zFxwDVWqljaCppaWlDa22/erVq6a0tNR2NExctg4vXrz4axN+XmnA1f87EKZFla5piVEtZwWA3H1sGO+zEbB7nT9/3pw7d87OCNyvcWZYsGCBHSUpzG3PI4SjVH+f6KuwI/uBcnUJyAIFWkj/hOh/0ana2a1OnTpljh07ZoqKiuzuYPv27Wbnzp22q3HW5QjJCc01wrxBCZfouxM15f0RPNXXRccW6MjG69SmSAuJUb1bXl7eQdHDhw9zhrWbRUaPgw03l9yLUZZT2sSJE+3Azk7n1OGqqioKV2tA2qzrfKgnytL5VF+E3+U0r8WVqRTgoqqGaCv3VwcOHDCFhYUWCnOgcZXmSOlElsKc1FyFkUYP8H2V6oYsifO0F2QV+q7qcK+FPwJRWlxFkq1BXt7FDNuRnp5uMjIy7KPnoqIsc5fiTIsdO3ZYYQ47FHa2RS7CnRC+o3XAASkFzFIKjlCXe6Yvwr5goWrspypX9cjTjry8PLstx8bQCnNhUZoHI1xolKYUZ2BWBg7s/v7+7sLtEmYgCjXsM0C/AW/3J8I8Ho1ziTCFG3hSgw2h3SxSODc310aUecwTHf4/drc2f7nr5fnCtGnTzIQJE8yUKVPsRpMpA+E2CLe47ICTVTLfV7tnDnv3NSV4kLdOG8mzrsK8MCPIizPCTiqwMmzYsMGeJXCDybylKIUZYTYO3qSEG9URs1QyfTWacup7pq9VgmdW0aqNzhlunSPMgxBKscZSgCnBOZdRpxRTISgoyPDghHAvx1xmKqHssbrchvANbVLXa8rjgvuxzjbsRNhf4d3aEFK4k8Lc7jAfufiYk1yA7GY8+OBC48mNI0q4pWfjSEpK6sLNtaFd/0tdMlPjqI9m3z7Lugv/VXss5lo9Hn0Ho8oIsr6ybDFqjCplOS/wRIeSFGY6OIcmzHtUjw7kOhdbmb43TvPvMG1g+yzrKhyjjWC+VnMDStcDdjLmMI+ZnI2lcwPMWUaTZYzSlOWiYwNBynShyrD2XtdUt0KpMFyztVd/ZB1hrtAALYYt6kblGnBaEOk257SR+UxxVgRGlMKEUeXQzmrB/IZsJ4cjnrWps8Vokb2hiuDV34N0R/glfNEUl4X3uToTI3QLfIn8bcvOzratmKeQ3FkkJCTYx88qwtzeunWrLXm8Ud10nrZQ41Rzn9S2a5Anwt8Dr+px8bGlKjVYLSo0UjJaXwLm5F10uw7WY56yE7x334Xb+hvHfn1XuJqEl6eyjjDb4kvgDfX2KOVzrvKP4ld0Xvtv8B/AE8Y2N0nSrKmsWCc4sTpn8BqoP685L2yUwS+0JQpTemRIvFgNpUq7jBYXwWa9X6UnwhvMBovBJHYy7RUHVNgZ5IeB9zhugiCwSH+dzAEFqqelOrutlGC5cp7s12c/BsF6ck8P5F9b3d/4PnhLM/L7LuJLwVqQrT+xUuwzUMgbAZkiVbIh4AcDLUv+B4Xq0XTiy23dAAAAAElFTkSuQmCC"/></g><path class="labels-nolife" filter="url(#blur-filter)" mask="url(#fade2-nolife)" d="M 354 978 h 1252 c 45 0 90 -33.75 90 -67.5 h -1236 l -37.5 33.75 Z"/><path class="background-nolife" style="animation: anim-path-background-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-path-background-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards" fill="url(#background-gradient)" d="M 234 844 H 321 l 56 -56 H 1920 v 120 H 234 c -11 -15 -11 -45 -10 -64 Z "/><path class="title-nolife" mask="url(#fade3-nolife)" d="M 321 844 h 1188 l 56 -56 h -1188 Z "/><image style="animation: anim-image-note-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-image-note-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards" x="320" y="858" width="78" height="80" href="data:image/png;base64,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"/><image style="visibility: ${classic}; animation: anim-g-text-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-g-text-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards" x="320" y="858" width="78" height="80" href="data:image/png;base64,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"/><g class="text-nolife" style="animation: anim-g-text-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-g-text-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards"><text class="title-nolife" x="402" y="831"/><text class="year-nolife" x="1668" y="841" text-anchor="end"/><text class="artist-nolife" x="430" y="894"/><text class="lyricists-composers-nolife" text-anchor="end" x="1668" y="892"/><text class="labels-nolife" x="470" y="961"/><path style="visibility: ${classic}" class="classic-nolife" d="M 1570 778 l 40 -40 H 1920 v 40 Z "/><text style="visibility: ${classic}" class="classic-nolife" x="1606" y="770" stroke-width="5" stroke="#00000030" filter="url(#blur-filter)">CLASSIQUE</text><text style="visibility: ${classic}" class="classic-nolife" x="1606" y="770" stroke-width="0.5" stroke="#E28951" filter="url(#blur-filter)">CLASSIQUE</text></g><g class="top-block-nolife" style="animation: anim-g-top-block-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-g-top-block-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards" mask="url(#fade4-nolife)" filter="url(#blur-filter)" ><path class="top-nolife block-nolife" stroke-width="2" d="M -30 892 H 294 c 22.5 -45 69 -90 138 -54 H 1950 v 9 H 399 l -54 54 H -30 Z "/><path class="top-nolife stroke-nolife" stroke-width="4" fill="none" d="M -30 901 H 345 l 54 -54 H 1950"/></g><g class="bottom-block-nolife" style="animation: anim-g-bottom-block-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-g-bottom-block-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards" mask="url(#fade4-nolife)" filter="url(#blur-filter)"><path class="bottom-nolife block-nolife" stroke-width="2" d="M -30 912 H 346 c 30 -6 60 -27 80 -54 H 1950 v -9 H 399 l -54 54 H -30 Z "/><path class="bottom-nolife stroke-nolife" stroke-width="4" fill="none" d="M -30 903 H 345 l 54 -54 H 1950"/></g></g><g class="panel-nolife" style="animation: anim-g-panel-nolife-1 ${dur1}ms linear ${delay1}ms 1 normal both, anim-g-panel-nolife-2 ${dur2}ms linear ${delay2}ms 1 normal forwards; transform-origin: 1920px 0"><text class="title-nolife" x="1920" y="30" text-anchor="end"/><text class="artist-nolife back-nolife" x="1920" y="62" text-anchor="end"/><text class="artist-nolife front-nolife" x="1920" y="62" text-anchor="end"/></g></svg>`);

          panelNolife.find(".title-nolife").text(panelNolifeTitle);
          panelNolife.find(".year-nolife").text(panelNolifeYear);
          panelNolife.find(".artist-nolife").text(panelNolifeArtist);
          panelNolife.find(".lyricists-composers-nolife").text(panelNolifeLyricistsComposers);
          panelNolife.find(".labels-nolife").text(panelNolifeLabels);

          ytFrame.before(panelNolife);

          maxWidth(panelNolife.find("g.big-panel-nolife text.title-nolife"), 1094);

          const artist = panelNolife.find("g.big-panel-nolife text.artist-nolife");
          const lyricistsComposers = panelNolife.find("g.big-panel-nolife text.lyricists-composers-nolife");
          if (artist[0].getBoundingClientRect().width + lyricistsComposers[0].getBoundingClientRect().width > 1208) {
            const width = maxWidth(lyricistsComposers, 604);
            maxWidth(artist, 604 + 604 - width);
          }
          maxWidth(panelNolife.find("g.big-panel-nolife text.labels-nolife"), 1084);
        }
      }
      panelNolifeResize();
    }
  }

  function maxWidth(text, max) {
    const width = text[0].getBoundingClientRect().width;
    if (width > max) {
      text[0].setAttribute("textLength", max);
      text[0].setAttribute("lengthAdjust", "spacingAndGlyphs");
      return max;
    } else {
      return width;
    }
  }

  if (typeof plugDJToolsExtensionUninstall == 'function') {
    plugDJToolsExtensionUninstall();
  }
  install();

  let uninstall = function () {
    if (smilId != undefined) {
      cancelAnimationFrame(smilId);
      smilId = undefined;
    }
    console.log(`Uninstalling plug.dj tools v${version}...`);
    if (observerMediaPanel != null) {
      observerMediaPanel.disconnect();
      observerMediaPanel = null;
    }
    if (observerPlaylistMenu != null) {
      observerPlaylistMenu.disconnect();
      observerPlaylistMenu = null;
    }
    if (observerApp != null) {
      observerApp.disconnect();
      observerApp = null;
    }
    if (observerDialogContainer != null) {
      observerDialogContainer.disconnect();
      observerDialogContainer = null;
    }
    if (observerCommunityInfo != null) {
      observerCommunityInfo.disconnect();
      observerCommunityInfo = null;
    }
    if (skipAtTimer != undefined) {
      clearTimeout(skipAtTimer);
      skipAtTimer = undefined;
    }
    $("#top-refresh-button, #fullscreen-layer, .playlist-buttons-import-export-tsv, #logo-nolife, #plugdj-tools-extension-css, #playlist-add-button, #playlist-synchro-button, #playlist-cut-button, #playlist-copy-button, #playlist-paste-button, #playlist-refresh-button, #playlist-sort-button, #playlist-clear-button, #playlist-gears-button, #media-panel .row div.item, #playlist-menu .menu .container .row div.item, .user-logo").remove();
    $(".user-logo-dropdown").parent().remove();
    $(".community__playing-controls").css("pointer-events", "");
    API.off(API.ADVANCE, advance);
    $(document).off("keydown", keydownDocument);
  }
  return uninstall;
})()
