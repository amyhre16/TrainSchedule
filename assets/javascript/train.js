$(document).ready(function() {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDGdtJuWAcZ5JkSHChHkp-1gI3xY9tmGDE",
		authDomain: "trainschedule-50b0c.firebaseapp.com",
		databaseURL: "https://trainschedule-50b0c.firebaseio.com",
		storageBucket: "trainschedule-50b0c.appspot.com",
		messagingSenderId: "40140588221"
	};
	firebase.initializeApp(config);

	var database = firebase.database();

	var trainName;
	var destination;
	var firstTrain;
	var frequency;
	var nextTrain;
	var minutesUntilNextTrain;

	$('.btn').on('click', function() {
		// grab the values in the text boxes, truncate the whitespace from the values and assign them to variables
		trainName = $('#trainName').val().trim();
		destination = $('#destination').val().trim();
		firstTrain = $('#firstTrainTime').val().trim();
		frequency = $('#frequency').val().trim();

		// push the time of the first train back 1 year to make sure it comes before current time
		firstTrain = moment(firstTrain, "hh:mm").subtract(1, "years");

		// calculate the difference between the first time and the current time
		var diffTime = moment().diff(moment(firstTrain), "minutes");

		// find the time since the last train
		var timeRemaining = diffTime % frequency;

		// calculate the minutes left until the next train
		minutesUntilNextTrain = frequency - timeRemaining;

		// create a moment object for the time the next train will arrive. The object is formatted to display as American time w/ AM/PM. For example, 00:00 will display as 12:00 AM
		nextTrain = moment().add(minutesUntilNextTrain, "minutes").format("hh:mm A");

		// create table data elements to display train data
		/*var trainNameData = $('<td>');
		trainNameData.text(trainName);

		var destinationData = $('<td>');
		destinationData.text(destination);

		var frequencyData = $('<td>');
		frequencyData.text(frequency);

		var nextArrivalData = $('<td>');
		nextArrivalData.text(nextTrain);

		var minutesUntilNextTrainData = $('<td>');
		minutesUntilNextTrainData.text(minutesUntilNextTrain);*/

		database.ref().push({
			trainName: trainName,
			destination: destination,
			frequency: frequency,
			nextTrain,
			minutesUntilNextTrain: minutesUntilNextTrain
		});
		/*// create a new table row element and append all of the table data elements to it
		var newTableRow = $('<tr>');
		newTableRow.append(trainNameData).append(destinationData).append(frequencyData).append(nextArrivalData).append(minutesUntilNextTrainData);

		// append the new row to the table
		$('.table').append(newTableRow);*/

		// empty the text boxes
		$('#trainName').val("");
		$('#destination').val("");
		$('#firstTrainTime').val("");
		$('#frequency').val("");
	});

	database.ref().on('child_added', function(snapshot) {
		console.log(snapshot.val());
		var trainNameData = $('<td>');
		trainNameData.text(snapshot.val().trainName);

		var destinationData = $('<td>');
		destinationData.text(snapshot.val().destination);

		var frequencyData = $('<td>');
		frequencyData.text(snapshot.val().frequency);

		var nextArrivalData = $('<td>');
		nextArrivalData.text(snapshot.val().nextTrain);

		var minutesUntilNextTrainData = $('<td>');
		minutesUntilNextTrainData.text(snapshot.val().minutesUntilNextTrain);

		// create a new table row element and append all of the table data elements to it
		var newTableRow = $('<tr>');
		newTableRow.append(trainNameData).append(destinationData).append(frequencyData).append(nextArrivalData).append(minutesUntilNextTrainData);

		// append the new row to the table
		$('.table').append(newTableRow);
	}, function(errorObject) {
		console.log("Errors handled: " + errorObject.code);
	});
});