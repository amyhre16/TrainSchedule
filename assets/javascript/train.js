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

	// create a variable that references the firebase database
	var database = firebase.database();

	// initialize variables for the database
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
		var diffTime = moment().diff(firstTrain, "minutes");

		// find the time since the last train
		var timeRemaining = diffTime % frequency;

		// calculate the minutes left until the next train
		minutesUntilNextTrain = frequency - timeRemaining;

		// create a moment object for the time the next train will arrive. The object is formatted to display as American time w/ AM/PM. For example, 00:00 will display as 12:00 AM
		nextTrain = moment().add(minutesUntilNextTrain, "minutes").format("hh:mm A");

		// push a new child object to the database
		database.ref().push({
			trainName: trainName,
			destination: destination,
			frequency: frequency,
			nextTrain: nextTrain,
			minutesUntilNextTrain: minutesUntilNextTrain
		});

		// empty the text boxes
		$('#trainName').val("");
		$('#destination').val("");
		$('#firstTrainTime').val("");
		$('#frequency').val("");
	}); // end of .btn on click event listener

	/*
		event listener that runs when a child object has been added to the database
	*/
	database.ref().on('child_added', function(snapshot) {
		/*
			variables w/ data in are what will be added to the data table
			snapshot.val() gets the object, to access its properties, call the property name after .val()
		*/
		var trainNameData = $('<td class="trainName">');
		trainNameData.text(snapshot.val().trainName);

		var destinationData = $('<td class="destination">');
		destinationData.text(snapshot.val().destination);

		var frequencyData = $('<td class="frequency">');
		frequencyData.text(snapshot.val().frequency);

		var nextArrivalData = $('<td class="nextTrain">');
		nextArrivalData.text(snapshot.val().nextTrain);

		var minutesUntilNextTrainData = $('<td class="minutes-remaining">');
		minutesUntilNextTrainData.text(snapshot.val().minutesUntilNextTrain);

		// create a new table row element and append all of the table data elements to it
		var newTableRow = $('<tr class="train">');
		newTableRow.append(trainNameData).append(destinationData).append(frequencyData).append(nextArrivalData).append(minutesUntilNextTrainData);

		// append the new row to the table
		$('.table').append(newTableRow);	
	}, function(errorObject) {
		console.log("Errors handled: " + errorObject.code);
	}); // end of 'child_added' event listener

	// this interval updates the minutes until the next train and the time the next train will arrive every minute
	var updateMinutes = setInterval(function() {
		// selects each table row with data in it and runs the function on each element
		$('tr.train').each(function() {
			/*
				grabs the minutes cell and assigns it to oldMinutes
				if there's more than a minute left,
					just decrement the minutes and display it in the table
			*/
			var oldMinutes = $(this).find('td.minutes-remaining').text();
			if (oldMinutes > 1) {
				var newMinutes = oldMinutes - 1;
				$(this).find('td.minutes-remaining').text(newMinutes);
			}
			/*
				if there is 1 minute left, then we don't need to decrement it b/c we don't want to display 0 minutes
					instead, we
						just display the frequency in the minutes away column
						add the frequency to the old time and display the new time
			*/
			else {
				$(this).find('td.minutes-remaining').text($(this).find('td.frequency').text());
				var oldTrainTime = $(this).find('td.nextTrain').text();
				var newTrainTime = moment(oldTrainTime, "hh:mm A").add($(this).find('td.frequency').text(), "minutes").format("hh:mm A");
				$(this).find('td.nextTrain').text(newTrainTime);
			}
		});
	}, 60000); // end of the interval
});