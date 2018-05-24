$(function () {
  const socket = io();
  var fileBox = $('#fileBox')
    , fileBoxLabel = $('#fileBoxLabel')
    , uploadButton = $('#uploadButton')
    , selectedFile = {}
    , defaultText
    , title = $('#title')
    , description = $('#description')
    , firstname = $('#firstname')
    , lastname = $('#lastname')
    , gender = $('#gender')
    , email = $('#email')
    , mobile = $('#mobile')
    , uploads = $('#uploads')
    , privacyStatus = $('#privacyStatus');


  /*****************************************************
   *                    FUNCTIONS                      *
   ****************************************************/


  function fileChosen(evnt) {
    selectedFile.video = evnt.target.files[0];

    selectedFile.hid = hid.val();
    // Text filler for title and description if left empty
    defaultText = selectedFile.video.name.split('.').slice(0)[0];
  }

  function resetInputFields() {
    title.val('').removeClass('valid')
    description.val('').removeClass('valid');
    firstname.val('').removeClass('valid')
    lastname.val('').removeClass('valid');
    email.val('').removeClass('valid')
    mobile.val('').removeClass('valid');
    fileBoxLabel.val('').removeClass('valid');
    fileBox.wrap('<form>').closest('form').get(0).reset();
    fileBox.unwrap();
  }

  function addFileInfo() {
    selectedFile.firstname = firstname.val() || defaultText;
    selectedFile.lastname = lastname.val() || defaultText;
    selectedFile.gender = gender.find(":selected").text().toLowerCase();
    selectedFile.email = email.val() || defaultText;
    selectedFile.mobile = mobile.val() || defaultText;

    selectedFile.title = title.val() || defaultText;
    selectedFile.description = description.val() || defaultText;
    selectedFile.privacyStatus = privacyStatus.find(":selected").text().toLowerCase();
  }

  /*****************************************************
   *                  LISTENERS                        *
   ****************************************************/

  $('select').material_select();

  fileBox.on('change', fileChosen);

  uploadButton.click(function (e) {
    /*****************************************************
     *               VALIDATION                       *
     ****************************************************/
    var x = document.getElementById("firstname").value;
    var y = document.getElementById("lastname").value;
    var t = document.getElementById("title").value;
    var d = document.getElementById("description").value;

    if (x == "") {
      alert("First Name must be filled out");
      return;
    }
    if (y == "") {
      alert("Last Name must be filled out");
      return;
    }
   


    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(document.getElementById("email").value)) {
    }
    else {
      alert("You have entered an invalid email address!")
      return

    }
    if (/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(document.getElementById("mobile").value)) {
    }
    else {
      alert("You have entered an invalid Mobile!")
      return
    }

    if (selectedFile.video === undefined) {
      alert("Please select a file");
      return
    }
    if (document.getElementById("hid").value == "err") {
      alert("Please record video");
      return
    }

    if (t == "") {
      alert("Provide a  Video Title");
      return;
    }
    if (d == "") {
      alert("Provide a  Video Description as well");
      return;
    }


    addFileInfo();
    resetInputFields();

    // Emit event via socket.io
    socket.emit('start', selectedFile);
    selectedFile.video = undefined;
    return false;
  });


  // Add List of recent uploads
  socket.on('done', function (video) {
    var liContent = '<li class="collection-item avatar"><i class="material-icons circle red">play_arrow</i><span class="title">Title</span><p>' + video.title + '</p></li>'

    if ($('#recentUploads').has('p')) {
      $('#empty').remove(); // Remove "No videos Uploaded Yet"
    }
    uploads.append(liContent);
    Materialize.toast('<span>Video uploaded successfully &nbsp;<i class="material-icons toast-icon" style="color:#46b705;">check_circle</i></span>', 4000)
  });
});

