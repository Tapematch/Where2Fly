![Where2Fly](https://raw.githubusercontent.com/Tapematch/Where2Fly/master/public/img/logo-schriftzug.png)

# [Where2Fly](https://where2fly.net/)

Phil Taubert
Daniel Mertens

Masterprojekt Medieninformatik Master - HTWK Leipzig
Betreuer: Herr Prof. Dr. Michael Frank

## 1. Projektziel

### 1a. Allgemeines Ziel

Ziel des Projektes ist eine Website zu entwickeln, welche sich als (Austausch-) Plattform an Drohnenbesitzer richtet. Es sollen Erfahrungen und Tipps ausgetauscht werden können zu den Punkten:

* Sicherer Luftraum für mehr Klarheit und über Rechtslage an bestimmten Orten

* Schnelles finden von neuen geeigneten Flugplätzen und Motiven

* genereller Austausch mit anderen Piloten zu Technik, Bedienung, etc.

Dafür werden die Informationen von Nutzern zusammengetragen, überprüft und auf einer Karte dargestellt. Dies könnten Plätze (Bsp.: Sehenswürdigkeiten) oder Bereiche (Bsp.: Seen) sein. Als technische Grundlage dienen hierfür die Koordinaten. Informationen zu den Plätzen sind:

* Objektname

* öffentlich / Privatgelände

* Flug (nur mit vorheriger Absprache) erlaubt?

* Einschränkungen

* Bilder

    * Möglichkeit eigens gehostete Bilder über URL anzeigen

    * API eines externen Imagehosters (Imgur) verwenden

* Bemerkungen

### 1b. Funktionen

* Startseite

    * Suche direkt nach Objekten

        * Objekt bereits eingetragen → Kurzinfo und Link zu Detailseite

        * Objekt nicht eingetragen → Möglichkeit neuen Datensatz anzulegen

    * in der Nähe eines bestimmten Ortes 

    * durch html5-Lokalisierung beim aktuellen Standort des Nutzers

* "Feed", Sammlung letzter Beiträge

    * letzte angelegte Objekte

    * letzte Bemerkungen

    * letzte Bilder

* Profilseite

    * angelegte Plätze

    * Favorisierte Plätze

    * verfasste Bemerkungen

    * hochgeladene Fotos

    * Nutzerdaten einsehen

        * Name, Kontaktdaten, Link zu Socialmedia-Profilen, gewerbliche Nutzung, UAV-Informationen

    * auf eigenem Profil besteht die Möglichkeit alle Daten zu editieren oder zu löschen

* Detailseite eines Standortes

    * Informationen zum Standort

        * Profil des Nutzers, Koordinaten, FlightLight, öffentliches/privates Gelände

    * Interaktionsmöglichkeiten

        * Ort favorisieren, Bemerkung schreiben, Foto hochladen, Informationen zum Ort bearbeiten	

* Seitenübergreifende Funktionen

    * Sprache ändern (Deutsch/Englisch)

    * Melden bei Verstoß gegen Rechte (Bsp.: Persönlichkeitsrecht/Flugrecht)

### 1c. Zielgruppe

Die Zielgruppe beschränkt sich nicht nur auf private und gewerbliche Piloten von Multicoptern mit Kameras, sondern schließt auch Personen die Luftaufnahmen von bestimmten Orten suchen mit ein. Durch das Profil von jedem Nutzer besteht die Möglichkeit der direkten Kontaktaufnahme. So entsteht zusätzlich eine Plattform über die Piloten für Luftaufnahmen gefunden werden können.

## 2. Verwendete Technologien

### 2a. Meteor

In der Planungsphase des Projekts wurde die Umsetzung mit Drupal als Grundlage beschlossen. Drupal ist ein flexibles und professionelles Content Management System, geschrieben in PHP.

Im Laufe des Semesters haben wir im Modul "Webtechnologien" jedoch das Meteor Framework kennengelernt, mit welchem die Programmierung von interaktiven Webapplikationen stark vereinfacht wird. Meteor ist ein Full-Stack Framework, damit werden Backend sowie Frontend entwickelt. Dabei wird ausschließlich Javascript als server- und clientseitige Programmiersprache verwendet, was die Integration der Google Maps Javascript API erleichtert. Da bei Where2Fly Interaktionen mit einer Karte im Vordergrund stehen, wurde Meteor anstatt Drupal als Basis verwendet. 

Ein weiterer Vorteil des Meteor Frameworks ist die große Anzahl einfach zu integrierender, von Drittentwicklern geschriebener Pakete ("Meteor Packages"), welche eine einfache Implementierung grundlegender Funktionen wie eine Benutzeranmeldung ermöglichen. Außerdem legt Meteor viel Wert auf die so genannte Reaktivität, durch welche Änderungen an persistenten Daten sofort auf sämtlichen verbundenen Clients sichtbar werden. Dies wird durch das eigens dafür entwickelte *Distributed Data Protocol *(DDP) realisiert, welches auf einer Publish-Subscribe Architektur basiert. Dabei wird mittels Javascript eine Verbindung über Websockets zum Server aufgebaut, über welche die Datenbank abgefragt wird sowie Ergebnisse und Veränderungen der Daten sofort gesendet werden. (NOTE:  https://blog.meteor.com/introducing-ddp-6b40c6aff27d)

### 2b. MongoDB

Meteor bietet eine tiefgehende Integration mit dem dokumentenbasierten Datenbanksystem MongoDB. Dieser wird als persistente Datenspeicherung, aber auch als sich ständig veränderte Datenschicht angesehen. So werden alle Daten, die bei der Interaktion mit der Applikation anfallen, in MongoDB verwaltet. 

Bei diesem Projekt betrifft dies unter anderem die Nutzer mit gespeicherten Orten und sämtlichen Informationen. Diese werden als *Collections gespeichert*, deren einzelne Einträge Javascript-Objekten ähneln. Diese können ohne vordefiniertes Schema gespeichert und abgerufen werden. (NOTE:  https://guide.meteor.com/collections.html#mongo-collections)

### 2c. Google Maps Javascript API

Für die Darstellung der Karten sowie Markierungen der gespeicherten Orte wird Googles Kartendienst mit der Google Maps Javascript API integriert. Diese bettet eine Landkarte in verschiedenen Konfigurationen auf der Website ein und nimmt Parameter für Markierungen entgegen, die dann auf der Karte an den richtigen Stellen angezeigt werden.

Die API ist bis zu 25.000 geladenen Karten am Tag kostenlos, was für die Entwicklung sowie eine lange Zeit nach der Veröffentlichung ausreichend sein wird. (NOTE:  https://developers.google.com/maps/pricing-and-plans/#details)

## 3. Dokumentation

Die gesamte Dokumentation ist im [Projekt](https://github.com/Tapematch/Where2Fly/blob/master/Masterprojekt%20Dokumentation.pdf) zu finden.