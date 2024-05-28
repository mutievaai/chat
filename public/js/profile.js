$(document).ready(() => {
  const $selectClass = $(".select-class");
  const $saveButton = $(".save-button");
  
  $selectClass.on("change", () => {
    $saveButton.css("display", "block");
  });

  $selectClass.select2({
    placeholder: "<- Choose ->",
    tags: true, // Allow custom tags
    allowClear: true
  });
});
