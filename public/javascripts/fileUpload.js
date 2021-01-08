FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode,
);

FilePond.setOptions({
  stylePanelAspectRatio: 150 / 400,
  stylePanelLayout:'compact',
  imageResizeTargetWidth: 100,
  imageResizeTargetHeight: 150,
  // styleItemPanelAspectRatio:120 / 100,
});

FilePond.parse(document.body);
