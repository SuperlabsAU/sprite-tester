export const MOVES = {
 reply:{name:'Reply All',type:'Noise',power:17,description:'Make it everyone’s problem.',quote:'You looped in the entire company. Even the printer.'},
 receipts:{name:'Bring Receipts',type:'Evidence',power:20,description:'Weaponise the paper trail.',quote:'You attached the email. The one from three weeks ago.'},
 boundaries:{name:'Set Boundaries',type:'Boundaries',power:12,guard:.6,description:'Deal damage. Block 60% this turn.',quote:'“That sounds outside my role.” A radical statement.'},
 circle:{name:'Circle Back',type:'Recovery',heal:24,guard:.35,uses:3,description:'Recover 24 morale. 3 uses per battle.',quote:'You postponed the problem until Future You is available.'}
};
export const STAFF = [
 {id:'hr',name:'Pat',role:'People & Culture',department:'PEOPLE',colour:'#cc7797',x:6,y:12,route:[[6,12],[6,13],[7,13],[6,13]],hp:66,weak:'Boundaries',level:3,
 intro:'“We’re a family here. A family with a probation period.”',after:'“I’ll put your boundaries in a policy nobody reads.”',badge:'People approval',
 moves:[['Mandatory Fun',13,'Pat scheduled team bonding during lunch.'],['Wellness Webinar',17,'The burnout seminar is compulsory. At 7 am.'],['Anonymous Survey',11,'Pat asks for your name on the anonymous survey.']]},
 {id:'sales',name:'Chad',role:'Growth & Vibes',department:'SALES',colour:'#da9b48',x:24,y:13,route:[[24,13],[23,13],[23,14],[24,14]],hp:72,weak:'Evidence',level:4,
 intro:'“Great news. I sold a feature that doesn’t exist. Can you build it by lunch?”',after:'“Fine. I’ll change ‘guaranteed’ to ‘aspirational’.”',badge:'Revenue approval',
 moves:[['Overpromise',16,'Chad committed you to a deadline. You were not consulted.'],['Quick Win',19,'The quick win requires a six-month rebuild.'],['Hustle Culture',12,'Chad calls sleep an untapped productivity opportunity.']]},
 {id:'product',name:'Morgan',role:'Head of Alignment',department:'PRODUCT',colour:'#7a87bb',x:14,y:5,route:[[14,5],[15,5],[15,6],[14,6]],hp:70,weak:'Noise',level:4,
 intro:'“Before we start, let’s align on what we mean by ‘start’.”',after:'“I’ve moved your request from ‘Discussion’ to ‘Further Discussion’.”',badge:'Alignment approval',
 moves:[['Scope Creep',18,'Morgan adds one tiny requirement. It has twelve sub-requirements.'],['Agile Ceremony',14,'A meeting has been scheduled to make meetings more efficient.'],['Roadmap Shuffle',15,'Your finished work is now ‘phase two’ of a cancelled project.']]},
 {id:'boss',name:'Brenda',role:'Chief Synergy Officer',department:'MANAGEMENT',colour:'#537b86',x:25,y:4,route:[[25,4]],hp:118,weak:'Evidence',level:7,
 intro:'“Leaving at five? I admire your part-time mindset.”',after:'“You’ve exceeded expectations. We’ll discuss compensation next year.”',badge:'Permission to clock off',
 moves:[['Urgent EOD',19,'Brenda sends an urgent task at 4:59 pm.'],['Strategic Pivot',23,'Brenda has seen a podcast. The entire strategy changes.'],['We’re a Family',17,'The family would like you to work this weekend.']]}
];
export const STATIONS=[
 {id:'coffee',name:'Coffee machine',x:4,y:3},
 {id:'printer',name:'Printer of Theseus',x:17,y:13},
 {id:'intern',name:'Alex · Intern',x:11,y:16},
 {id:'lift',name:'Lift · Clock off',x:14,y:19}
];
