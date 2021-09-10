/**************************************************************************
	Converts Gregorain dates to Jalaali dates used in Iran.
	
	Copyright (C) 2021 Mazdakyaar

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

	To contact with the author mail to : mazdakyaar@gmail.com
***************************************************************************/

"use strict";	// This lonely string triggers strict mode

console.debug("jalaali.js is loaded");

const jalaaliCalendar = {

	daysOfMonths : new Array(31,
              31,
              31,
              31,
              31,
              31,
              30,
              30,
              30,
              30,
              30,
              29),
              
	cumulativeDaysOfMonths : new Array(0,
            31,
            62,
            93,
            124,
            155,
            186,
            216,
            246,
            276,
            306,
            336,
            365),
   
	EpochPersianYear : 1348,
	EpochPersianMonth: 9,	// Indexed from 0
	EpochPersianDayOfMonth: 11,
	nextYearAfterEpoch: 1349,
	week: new Array(
	"شنبه",
	"یکشنبه",
	"دوشنبه",
	"سه شنبه",
	"چهارشنبه",
	"پنجشنبه",
	"جمعه"
	),
	months : new Array("فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"),
	
	farsiDigit : new Array('۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'),

	transFarsiDigits : function(s)
	{
		var res="";
		for (var i=0;i<s.length;i++)
		{
			var code = s.charCodeAt(i);
			if (48<=code && code<=57)
				res += this.farsiDigit[code-48];
			else
				res += s.charAt(i);
		}
		return res;
	},

	/**
	@param time Unix time in seconds
	@return String representaiton of the time in Jalaali calendar
	*/
	convertToJalaali : function (time)
	{
		let aMinuteLong = 60;
		let anHourLong = 60*aMinuteLong;
		let oneDayLong = 24*anHourLong;
		let dayOfYearOfEpoch = this.cumulativeDaysOfMonths[this.EpochPersianMonth] + this.EpochPersianDayOfMonth;
		let passedDaysFromEpochToEndOf1348 = 365 - dayOfYearOfEpoch + 1;
		// Unix time at the beginning of 1349/1/1 0:00:00 UTC
    	let UnixTimeAtEndOf1348 = passedDaysFromEpochToEndOf1348 * oneDayLong;
		
		var year,month,weekday,day;
		
		if (time <= UnixTimeAtEndOf1348)
        {
            year = this.EpochPersianYear;
            let offsetDays = Math.floor(time/oneDayLong);
            weekday = (offsetDays+3)%7;

            month = this.EpochPersianMonth;
            day = offsetDays + this.EpochPersianDayOfMonth;
            while (day>this.daysOfMonths[month])
            {
                day -= this.daysOfMonths[month];
                month++;
            }
        }
        else
        {
            const daysInFourYearPeriod = 1461; // 4*365+1

            // This value include the last day which has not passed completely
            let totalDaysFrom1349 = Math.floor((time - UnixTimeAtEndOf1348)/oneDayLong) + 1;

            weekday = (totalDaysFrom1349+6)%7;

            let fourYearPeriods = Math.floor(totalDaysFrom1349 / daysInFourYearPeriod);
            let reminderDays = totalDaysFrom1349 % daysInFourYearPeriod;
            year = this.nextYearAfterEpoch + 4*fourYearPeriods;

            if (reminderDays==0)
            {
                reminderDays=365;
                year--;
            }
            else {
                if (reminderDays > 365) {
                    year++;
                    reminderDays -= 365;
                }
                if (reminderDays > 365) {
                    year++;
                    reminderDays -= 365;
                }
                if (reminderDays > 366) {
                    year++;
                    reminderDays -= 366;
                }
            }


            if (reminderDays==366)
            {
                month = 11;
                day = 30;
            }
            else {

                month = 0;
                while (reminderDays > this.daysOfMonths[month]) {
                    reminderDays -= this.daysOfMonths[month];
                    month++;
                }


                day = reminderDays;
            }
        }		
				
		return this.week[weekday]+" "+this.transFarsiDigits(day.toString())+" "+
			this.months[month]+" "+this.transFarsiDigits(year.toString());
	}
};
