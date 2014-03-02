//
// Typofinder for domain typo discovery
// 
// Released as open source by NCC Group Plc - http://www.nccgroup.com/
// 
// Developed by Ollie Whitehouse, ollie dot whitehouse at nccgroup dot com
//
// http://www.github.com/nccgroup/typofinder
//
// Released under AGPL see LICENSE for more information#
//

// -------------------------------------
// Globals
// -------------------------------------
var intPBarMax = 0;
var intPBarCount = 0;
var domainsNoResults = new Array();
var masterData = null;


// -------------------------------------
//
// -------------------------------------
function getCookies() {
    // Set cookie
    try {
        document.getElementById('host').value = getCookie("typofinder-domain");
    } catch (err) {

    }

    try {
        if (getCookie("typofinder-typos") == "true") document.getElementById('typos').checked = true;
        else if (getCookie("typofinder-typos") == "") document.getElementById('typos').checked = true;
        else document.getElementById('typos').checked = false;
    } catch (err) {

    }

    try {
        if (getCookie("typofinder-bitflip") == "true") document.getElementById('bitflip').checked = true;
        else if (getCookie("typofinder-bitflip") == "") document.getElementById('bitflip').checked = true;
        else document.getElementById('bitflip').checked = false;
    } catch (err) {

    }

    try {
        if (getCookie("typofinder-homoglyph") == "true") document.getElementById('homoglyph').checked = true;
        else if (getCookie("typofinder-homoglyph") == "") document.getElementById('homoglyph').checked = true;
        else document.getElementById('homoglyph').checked = false;
    } catch (err) {

    }

    try {
        if (getCookie("typofinder-tlds") == "true") document.getElementById('tld').checked = true;
        else if (getCookie("typofinder-tlds") == "") document.getElementById('tld').checked = true;
        else document.getElementById('tld').checked = false;
    } catch (err) {

    }

    try {
        sValue = getCookie("typofinder-typoamount");
        if(sValue != "" && getCookie("typofinder-typoamountdesc") != "" ){
            document.getElementById('typoamountdesc').value = getCookie("typofinder-typoamountdesc");
            $("#slider").slider('value', sValue);
        } else {
            $("#slider").slider('value', 100);
            document.getElementById('typoamountdesc').value = "Rigorous";
        }
    } catch (err) {
        console.log("error");
        $("#slider").slider('value', 100);
        document.getElementById('typoamountdesc').value = "Rigorous";
    }

    try {
        if (getCookie("typofinder-doppelganger") == "true") document.getElementById('doppelganger').checked = true;
        else if (getCookie("typofinder-doppelganger") == "") document.getElementById('doppelganger').checked = true;
        else document.getElementById('doppelganger').checked = false;
    } catch (err) {

    }

    try {
        if (getCookie("typofinder-noreg") == "true") document.getElementById('noreg').checked = true;
        else if (getCookie("typofinder-noreg") == "") document.getElementById('noreg').checked = false;
        else document.getElementById('noreg').checked = false;
    } catch (err) {

    }

}

// -------------------------------------
// Get the original domains data
// -------------------------------------
function getMasterData() {
    var URL = "./entity.ncc";
    var strTag = " ( ";
    var intCount = 0;

    $.post(URL, { host: document.getElementById("host").value }, function (data) {

            masterData = data;
        })
        .fail(function (xhr, textStatus, errorThrown) {
    
        })
        .always(function (data) {
    
        }, 'json');

    intPBarCount++;
    $("#progressbar").progressbar("option", "value", intPBarCount);
}

// -------------------------------------
// This generates the accordian tag for a domain
// note: this needs to set bVal true for it to appear
// -------------------------------------
function generateTag(data) {
    var bVal = false;
    var strTag = "( ";

    // IPv4 Address
    if (data.IPv4Addresses.length > 0) {
        strTag = strTag + "IPv4 ";
        bVal = true;
    }

    // IPv6 Address
    if (data.IPv6Addresses.length > 0) {
        strTag = strTag + "IPv6 ";
        bVal = true;
    }

    // MX Records
    if (data.aMX.length > 0) {
        strTag = strTag + "MX ";
        bVal = true;
    }

    // www IPv4 Address
    if (data.wwwv4.length > 0) {
        strTag = strTag + "WWWv4 ";
        bVal = true;
    }

    // www IPv6 Address
    if (data.wwwv6.length > 0) {
        strTag = strTag + "WWWv6 ";
        bVal = true;
    }

    // m IPv4 Address
    if (data.mv4.length > 0) {
        strTag = strTag + "Mv4 ";
        bVal = true;
    }

    // m IPv6 Address
    if (data.mv6.length > 0) {
        strTag = strTag + "Mv6 ";
        bVal = true;
    }

    // webmail IPv4 Address
    if (data.webmailv4.length > 0) {
        strTag = strTag + "WebMailv4 ";
        bVal = true;
    }

    // webmail IPv6 Address
    if (data.webmailv6.length > 0) {
        strTag = strTag + "WebMailv6 ";
        bVal = true;
    }

    strTag = strTag + ")";

    // safe browsing
    if (data.SafeBrowsing.length > 0) {
        strTag = strTag + "SafeBrowsingAlert ";
        bVal = true;
    }


    if (bVal == true) return strTag;
    else {
        domainsNoResults.push(data.strDomain); // likely no longer needed
        return null;
    }
}

// -------------------------------------
// this returns an image DOM object
// for the flag for the geo of the 
// IPv4 address
// -------------------------------------
function geoIPImageIPv4(sIP, strTBL) {
    var URL = "./geov4.ncc/" + sIP;
    var img = document.createElement('img');
    img.src = URL;
    if (strTBL != null) {
        strTBL = strTBL + "<img src =\"" + URL + "\"><br/>"; // this is horrible and dangerous
    }

    return strTBL;
}

// -------------------------------------
// this returns an image DOM object
// for the flag for the geo of the 
// IPv6 address
// -------------------------------------
function geoIPImageIPv6(sIP, strTBL) {
    var URL = "./geov6.ncc/" + sIP;
    var img = document.createElement('img');
    img.src = URL;
    if (strTBL != null) {
        strTBL = strTBL + "<img src =\"" + URL + "\"><br/>"; // this is horrible and dangerous
    }

    return strTBL;
}

// -------------------------------------
// this generates the results table row contents for this domain
// -------------------------------------
function fillDetails(data) {
    var ul = null;
    var li = null;
    var ourTD = null;

    var strTBLIP = ""; // used for v4 and v6 results column

    // IPv4 Address
    if (data.IPv4Addresses.length > 0) {
        for (intCount = 0; intCount < data.IPv4Addresses.length; intCount++) {
            strTBLIP = strTBLIP + "IPv4: " + data.IPv4Addresses[intCount];
            strTBLIP = geoIPImageIPv4(data.IPv4Addresses[intCount], strTBLIP);
        }
    }


    // IPv6 Address
    if (data.IPv6Addresses.length > 0) {
        for (intCount = 0; intCount < data.IPv6Addresses.length; intCount++) {
            strTBLIP = strTBLIP + "IPv6: " + data.IPv6Addresses[intCount];
            strTBILP = geoIPImageIPv6(data.IPv6Addresses[intCount], strTBLIP);
        }
    }

    // MX Records
    var strTBLMX = "";
    if (data.aMX.length > 0) {
        for (intCount = 0; intCount < data.aMX.length; intCount++) {
            strTBLMX = strTBLMX + data.aMX[intCount] + "<br/>";


            if (data.aMXIPv4[data.aMX[intCount]] != null) {
                for (IP in data.aMXIPv4[data.aMX[intCount]]) {
                    strTBLMX = strTBLMX + "- IPv4: " + data.aMXIPv4[data.aMX[intCount]][IP];
                    strTBLMX = geoIPImageIPv4(data.aMXIPv4[data.aMX[intCount]][IP], strTBLMX);
                }
            }


            if (data.aMXIPv6[data.aMX[intCount]] != null) {
                for (IP in data.aMXIPv6[data.aMX[intCount]]) {
                    strTBLMX = strTBLMX + "- IPv6: " + data.aMXIPv6[data.aMX[intCount]][IP];
                    strTBLMX = geoIPImageIPv6(data.aMXIPv6[data.aMX[intCount]][IP], strTBLMX);
                }
            }

        }
    }

    // www IPv4 Address
    var strTBLwww = "";
    if (data.wwwv4.length > 0) {
        for (intCount = 0; intCount < data.wwwv4.length; intCount++) {
            strTBLwww = strTBLwww + "IPv4: " + data.wwwv4[intCount]
            strTBLwww = geoIPImageIPv4(data.wwwv4[intCount], strTBLwww);
        }
    }

    // www IPv6 Address
    if (data.wwwv6.length > 0) {
        for (intCount = 0; intCount < data.wwwv6.length; intCount++) {
            strTBLwww = strTBLwww + "IPv6: " + data.wwwv6[intCount]
            strTBLwww = geoIPImageIPv6(data.wwwv6[intCount], strTBLwww);
        }
    }

    // m IPv4 Address
    var strTBLm = "";
    if (data.mv4.length > 0) {
        for (intCount = 0; intCount < data.mv4.length; intCount++) {
            strTBLm = strTBLm + "IPv4 " + data.mv4[intCount];
            strTBLm = geoIPImageIPv4(data.mv4[intCount], strTBLm);
        }
    }

    // m IPv6 Address
    if (data.mv6.length > 0) {
        for (intCount = 0; intCount < data.mv6.length; intCount++) {
            strTBLm = strTBLm + "IPv6: " + data.mv6[intCount];
            strTBLm = geoIPImageIPv6(data.mv6[intCount], strTBLm);
        }
    }

    // webmail IPv4 Address
    var strTBLwebmail = "";
    if (data.webmailv4.length > 0) {
        for (intCount = 0; intCount < data.webmailv4.length; intCount++) {
            strTBLwebmail = strTBLwebmail + "IPv4: " + data.webmailv4[intCount];
            strTBLwebmail = geoIPImageIPv4(data.webmailv4[intCount], strTBLwebmail);
        }
    }

    // webmail IPv6 Address
    if (data.webmailv6.length > 0) {
        for (intCount = 0; intCount < data.webmailv6.length; intCount++) {
            strTBLwebmail = strTBLwebmail + "IPv6: " + data.webmailv6[intCount];
            strTBLwebmail = geoIPImageIPv6(data.webmailv6[intCount], strTBLwebmail);
        }
    }

    var strDomain = "";

    if (document.getElementById("host").value == data.strDomain) {
        strDomain = data.strDomain + " (original)";
    } else {
        strDomain = data.strDomain;
    }

    // Add the results row to the table
    $('#resultstabletable').dataTable().fnAddData(
                                                [
                                                    null,
                                                    strDomain, // domain
                                                    strTBLIP, // IP
                                                    strTBLMX, // MX
                                                    strTBLwww, // www.
                                                    strTBLwebmail, // webmail.
                                                    strTBLm, // m.
                                                    data.SafeBrowsing // safe browsing
                                                ]
                                            );

}

// -------------------------------------
// this is called for each domain
// to parse the JSON results
// -------------------------------------
function loadDetails(strDomain) {
    var URL = "./entity.ncc";
    var intCount = 0;

    $.post(URL, { host: strDomain }, function (data) {

        var strTag = generateTag(data);
        if (strTag != null) {
            fillDetails(data);
        } else {
            // Add the no results row to the table
            $('#notregtabletable').dataTable().fnAddData(
                                                [
                                                    strDomain // domain
                                                ]
                                            );
        }

        intPBarCount++

        if (intPBarCount >= intPBarMax) {
            // Hide the progress bar
            document.getElementById("progressbar").style.display = "none";
            // Shows the original form
            document.getElementById("typogulator").style.display = "block";
            // Shows the results table
            document.getElementById("resultstable").style.display = "block";
            // Check the setting
            if (document.getElementById('noreg').checked == true) {
                // Shows the no results table   
                document.getElementById("notregtable").style.display = "block";
                // Shows the titles (we don't need to show both if the user doesn't wish to show the second
                document.getElementById("reg").style.display = "block";
                document.getElementById("unreg").style.display = "block";
            }
        }

        $("#progressbar").progressbar("option", "value", intPBarCount);
    })
        .fail(function (xhr, textStatus, errorThrown) {

        })
        .always(function (data) {

        }, 'json');
}


/* Formating function for row details */
function fnFormatDetails ( oTable, nTr )
{
    var aData = oTable.fnGetData( nTr );
    var strDomain = aData[1];
    if (strDomain.indexOf(" ") > -1)
    {
        strDomain = strDomain.substr(0, strDomain.indexOf(" "));
    }

    // var sOut = '';
    var domOut = document.createDocumentFragment();

    //Links
    if (aData[4] != "" || aData[5] != "" || aData[6] != "")
    {
        // sOut += '<h5>Links (be careful!):</h5>';
        var domH5 = document.createElement('h5');
        domH5.innerText = "Links (be careful!)";
        domOut.appendChild(domH5);

        // sOut += '<table cellpadding="5" cellspacing="0" border="0">';
        var domTBL = document.createElement("table");
        domTBL.setAttribute('cellpadding', 5);
        domTBL.setAttribute('cellspacing', 0);
        domTBL.setAttribute('border', 0);


        if (aData[2] != "")
        {
            var domTR = document.createElement('tr');
            domTBL.appendChild(domTR);

            var domTD = document.createElement('td');
            domTR.appendChild(domTD);

            aLink = document.createElement('a');
            strHost = "http://" + strDomain;
            aLink.href = strHost;
            aLink.addEventListener('click',
                function (event) {
                    event.preventDefault();
                    window.open(this.href);
                },
            false);
            aLink.innerText = strDomain;

            domTD.appendChild(aLink);
        }
        if (aData[4] != "")
        {
            var domTR = document.createElement('tr');
            domTBL.appendChild(domTR);

            var domTD = document.createElement('td');
            domTR.appendChild(domTD);

            aLink = document.createElement('a');
            strHost = "http://www." + strDomain;
            aLink.href = strHost;
            aLink.addEventListener('click',
                function (event) {
                    event.preventDefault();
                    window.open(this.href);
                },
            false);
            aLink.innerText = "www." + strDomain;

            domTD.appendChild(aLink);
        }
        if (aData[5] != "")
        {
            var domTR = document.createElement('tr');
            domTBL.appendChild(domTR);

            var domTD = document.createElement('td');
            domTR.appendChild(domTD);

            aLink = document.createElement('a');
            strHost = "http://webmail." + strDomain;
            aLink.href = strHost;
            aLink.addEventListener('click',
                function (event) {
                    event.preventDefault();
                    window.open(this.href);
                },
            false);
            aLink.innerText = "webmail." + strDomain;

            domTD.appendChild(aLink);
        }
        if (aData[6] != "")
        {
            var domTR = document.createElement('tr');
            domTBL.appendChild(domTR);

            var domTD = document.createElement('td');
            domTR.appendChild(domTD);

            aLink = document.createElement('a');
            strHost = "http://m." + strDomain;
            aLink.href = strHost;
            aLink.addEventListener('click',
                function (event) {
                    event.preventDefault();
                    window.open(this.href);
                },
            false);
            aLink.innerText = "m." + strDomain;

            domTD.appendChild(aLink);
        }
        
        // sOut += '</table>';
        domOut.appendChild(domTBL);
    }

    //Whois
    var domH5Whois = document.createElement('h5');
    domH5Whois.innerText = "WHOIS Data:";
    domOut.appendChild(domH5Whois);

    var domPre = document.createElement('pre');
    domPre.setAttribute('class', 'whois');
    domPre.innerText = "Loading...\r\n\r\n";
    domOut.appendChild(domPre);

    $.ajax({
      url: "whois.ncc/"+strDomain
    })
    .done(function( msg ) {
      oTable.$(nTr).next().find(".whois").text(msg);
    });

    return domOut;
}

var oTable;

// -------------------------------------
// Ready event (i.e. entry point)
// http://gilbert.pellegrom.me/html-forms-to-ajax-forms-the-easy-way/
// -------------------------------------
$(document).ready(function () {

    // init the slider
    $("#slider").slider({
        value: 100,
        min: 0,
        max: 100,
        step: 50,
        slide: function (event, ui) {
            $("#typoamount").val(ui.value);
            if (ui.value < 50) {
                $("#typoamountdesc").val("Quick");
            }
            else if (ui.value < 100) {
                $("#typoamountdesc").val("Balanced");
            }
            else {
                $("#typoamountdesc").val("Rigorous");
            }
        }
    });
    $("#typoamountdesc").val("Rigorous");

    // init the accordion
    $("#results").accordion();
    $("#results").accordion("option", "heightStyle", "content");

    // init the progressbar
    $("#progressbar").progressbar({
        value: 0
    });

    // init the data table
    oTable = $('#resultstabletable').dataTable({
        "iDisplayLength": 100,
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": [0] }
        ],
        "aaSorting": [[1, 'asc']],
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $('td:first', nRow).html('<img src="images/add.png">');

            /* Add event listener for opening and closing details
            * Note that the indicator for showing which row is open is not controlled by DataTables,
            * rather it is done here
            */
            $('td:first-of-type img', nRow).on('click', function () {
                var nTr = $(this).parents('tr')[0];
                if (oTable.fnIsOpen(nTr)) {
                    /* This row is already open - close it */
                    this.src = "images/add.png";
                    oTable.fnClose(nTr);
                }
                else {
                    /* Open this row */
                    this.src = "images/minus.png";
                    oTable.fnOpen(nTr, fnFormatDetails(oTable, nTr), 'details');
                    /* Ensure that the new row is as wide as the table is now that it has the extra details column */
                    newrow = $(this).closest("tr").next("tr").children("td");
                    newrow.attr("colspan", parseInt(newrow.attr("colspan")) + 1);
                }
            });
        }
    });

    // init the data table
    o2Table = $('#notregtabletable').dataTable({
        "iDisplayLength": 100,
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": [0] }
        ],
        "aaSorting": [[1, 'asc']] 
        
        });

    // Hide the progressbar
    document.getElementById("progressbar").style.display = "none";

    //Autofocus the search box
    $("#host").focus();

    // Read the cookie values if present from a previous session
    getCookies();

    // Submit function processing
    $("#typogulator").submit(function () {
        // Hide the form
        document.getElementById("typogulator").style.display = "none";
        // Hide the results table
        document.getElementById("resultstable").style.display = "none";
        // Hide the results table
        document.getElementById("notregtable").style.display = "none";
        // Shows the title
        document.getElementById("reg").style.display = "none";
        document.getElementById("unreg").style.display = "none";
        // Reset and show the progress bar
        intPBarCount = 0;
        $("#progressbar").progressbar("option", "value", 0);
        document.getElementById("progressbar").style.display = "block";
        // Reset the list of domains which didn't yield results 
        domainsNoResults = new Array();
        // Reset the table
        $('#resultstabletable').dataTable()._fnClearTable();
        // Reset the no results table
        $('#notregtabletable').dataTable()._fnClearTable();

        // Set cookie
        try {
            setCookie("typofinder-domain", document.getElementById('host').value, 365);
        } catch (err) {
            setCookie("typofinder-domain", "false", 365);
        }

        try {
            setCookie("typofinder-typos", document.getElementById('typos').checked, 365);
        } catch (err) {
            setCookie("typofinder-typos", "false", 365);
        }

        try {
            setCookie("typofinder-bitflip", document.getElementById('bitflip').checked, 365);
        } catch (err) {
            setCookie("typofinder-bitflip", "false", 365);
        }

        try {
            setCookie("typofinder-homoglyph", document.getElementById('homoglyph').checked, 365);
        } catch (err) {
            setCookie("typofinder-homoglyph", "false", 365);
        }

        try {
            setCookie("typofinder-tlds", document.getElementById('tld').checked, 365);
        } catch (err) {
            setCookie("typofinder-tlds", "false", 365);
        }

        try {
            setCookie("typofinder-typoamount", $('#slider').slider("option", "value"), 365);
        } catch (err) {
            setCookie("typofinder-typoamount", 100, 365);
            setCookie("typofinder-typoamountdesc", "Rigorous", 365);
        }

        try {
            setCookie("typofinder-typoamountdesc", document.getElementById('typoamountdesc').value, 365);
        } catch (err) {
            setCookie("typofinder-typoamount", 100, 365);
            setCookie("typofinder-typoamountdesc", "Rigorous", 365);
        }

        try {
            setCookie("typofinder-doppelganger", document.getElementById('doppelganger').checked, 365);
        } catch (err) {
            setCookie("typofinder-doppelganger", false, 365);
        }

        try {
            setCookie("typofinder-noreg", document.getElementById('noreg').checked, 365);
        } catch (err) {
            setCookie("typofinder-noreg", false, 365);
        }

        //Do the AJAX post
        $.post($("#typogulator").attr("action"), $("#typogulator").serialize(), function (data) {

            // max for the progress bar
            intPBarMax = data.length + 1; // we add one to factor in the first request

            // set the max on the progress bar
            $("#progressbar").progressbar("option", "max", data.length);

            // Get the original domains data
            getMasterData();

            // now loop through and process them
            for (key in data) {
                // the success function
                loadDetails(data[key]);
            }


        })
            .fail(function (xhr, textStatus, errorThrown) {
                console.log("error " + textStatus)
                document.getElementById("progressbar").style.display = "none";
                document.getElementById("resultstable").style.display = "none";
                document.getElementById("notregtabletable").style.display = "none";
                document.getElementById("typogulator").style.display = "block";
            })
            .always(function (data) {
                //console.log(data)
            }, 'json');

        //Important. Stop the normal POST
        return false;
    });
});
