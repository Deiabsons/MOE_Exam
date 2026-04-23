package com.exam.moe.data

import com.exam.moe.model.Question

object QuestionData {
    val questions = listOf(
        // PART 1 (IDs 1001-1025)
        Question(1001, "Abbreviation of FAA.", listOf("Federal Authority Administration", "Federal Aviation Administration", "Federal Aviation Agency"), 1, "20"),
        Question(1002, "EgyptAir Maintenance and Engineering is committed to:", listOf("Ensure safety standards not reduced", "Ensure safety standards reduced", "Ensure safety reduced"), 0, "25"),
        Question(1003, "Brief details of facilities are described in:", listOf("EGME 108/108E", "EGME 223", "EGME 040"), 0, "41"),
        Question(1004, "Submit proposal draft using:", listOf("Form No 204", "Form No 118", "Form No. 800"), 0, "54"),
        Question(1005, "Person designated to ensure airworthiness NDT personnel qualification:", listOf("Responsible NDT Level 3", "Accountable Manager", "Senior Director"), 0, "26"),
        Question(1006, "Person who Facilitate hazard identification:", listOf("CMD", "Accountable Manager", "Safety Director"), 2, "29"),
        Question(1007, "Developing production and manpower planning systems:", listOf("AMSD", "CMSD", "A & B"), 2, "30"),
        Question(1008, "Category C certifying staff list:", listOf("EGME010", "EGME100", "EGME012"), 0, "36"),
        Question(1009, "Any change procedures need prior approval from:", listOf("EASA", "OSAC", "A & B"), 2, "50"),
        Question(1010, "Renewal of C/S authorization date:", listOf("Changes not Requiring Prior Approval", "Changes Requiring", "Changes need senior director"), 0, "54"),
        Question(1011, "Parts reached life limit or non-repairable:", listOf("Standard", "Unsalvageable", "Unservicable"), 1, "64"),
        Question(1012, "Each unit respond to recall list:", listOf("5 days after", "5 days before", "5 days maximum"), 1, "96"),
        Question(1013, "Issue EO use alternative tool:", listOf("Hangar", "subcontracted", "Work shop"), 1, "104"),
        Question(1014, "Airworthiness Directives issued by:", listOf("CAA of manufacturer", "owner", "CAA of regestration"), 0, "121"),
        Question(1015, "Ensure AMP status stated in:", listOf("TLB", "CRS", "EASA Form One"), 1, "120"),
        Question(1016, "Form 234 Customer Component AD Follow up:", listOf("work shop TS", "work shop CS", "A & B"), 0, "122"),
        Question(1017, "Verification statement of Clear Tools:", listOf("860", "861", "862"), 2, "140"),
        Question(1018, "If AD issued and overdue:", listOf("issue EASA 1", "stop release inform customer", "attach 601T"), 1, "122"),
        Question(1019, "CRS for workshops:", listOf("506B", "TLB", "EASA Form 1"), 2, "130"),
        Question(1020, "Release certificate is only issued by staff listed in:", listOf("EGME030", "EGME010", "EGME020"), 1, "139"),
        Question(1021, "Scrapped Parts Tag for defective expendables:", listOf("818", "116C", "401"), 0, "153"),
        Question(1022, "Auditor competency records archived for:", listOf("1 year", "3 years", "10 years"), 1, "264"),
        Question(1023, "Responsible to provide last revision maintenance data:", listOf("Library", "Customer", "EASA"), 1, "174"),
        Question(1024, "During recall organizational unit will:", listOf("Affix 110 and Issue 401T", "Affix 110 and Issue 601T", "Affix 110 only"), 0, "96"),
        Question(1025, "EGME070 Engine Maintenance Licensed Engineers list:", listOf("TRUE", "FALSE"), 0, "37"),

        // PART 2 (IDs 1-40)
        Question(1, "Corporate authority for financing maintenance:", listOf("NDT 3", "Accountable Manager", "Senior Director"), 1, "26"),
        Question(2, "Independent audit system monitor:", listOf("CMD", "AM", "SD"), 0, "28"),
        Question(3, "Monitor EGME activities for compliance:", listOf("CMD", "AM", "SD"), 0, "28"),
        Question(4, "Ensuring competency has been assessed:", listOf("CMD", "Accountable Manager", "SD"), 1, "28"),
        Question(5, "Monitoring amendment of MOE:", listOf("CMD", "AM", "SD"), 0, "29"),
        Question(6, "Monitor implementation to mitigate risks:", listOf("CMD", "AM", "Safety Director"), 2, "29"),
        Question(7, "Ensuring competence of maintenance personnel:", listOf("AMSD", "CMSD", "A & B"), 2, "30"),
        Question(8, "B1, B2 support staff support category C in:", listOf("Line", "base", "A & B"), 1, "36"),
        Question(9, "NDT authorization allow issue EASA Form One:", listOf("TRUE", "FALSE"), 0, "37"),
        Question(10, "EGME policy have contracted staff:", listOf("TRUE", "FALSE"), 1, "38"),
        Question(11, "Staff change more than 10% follows:", listOf("less 10%", "more 10%", "more than 10% with change"), 2, "38"),
        Question(12, "Clothes change when contaminated:", listOf("composite material shop", "Placard", "Atec"), 0, "43"),
        Question(13, "A1 rating weight:", listOf("Below 5700", "Above 5700", "Not AB"), 1, "44"),
        Question(14, "LM location no Hangar scope:", listOf("TRUE", "FALSE"), 0, "46"),
        Question(15, "Scope of Work each LM loc refer to:", listOf("EGME040", "EGME030", "EGME050"), 2, "46"),
        Question(16, "Specialized activities Painting Repairs:", listOf("EGME100", "EGME010", "EGME001"), 2, "49"),
        Question(20, "P/N S/N match Purchase Order 806-A:", listOf("Staff", "material inspectors", "Purchasing"), 1, "67"),
        Question(21, "Discrepancy found inspector will:", listOf("818 & 402", "841 & 402", "841 & 401"), 1, "69"),
        Question(23, "Non-Repairable components fill form:", listOf("Safety Notify", "EASA 1", "818"), 2, "81"),
        Question(24, "Store assigned production unit admin unit:", listOf("Bench Stock", "Satellite", "Complex"), 0, "77"),
        Question(25, "Store assigned production unit admin directorate:", listOf("Bench Stock", "Satellite", "Complex"), 1, "77"),
        Question(27, "Store not assigned admin directorate:", listOf("Bench Stock", "Satellite", "Complex"), 2, "77"),
        Question(29, "Calibrate Before Use form:", listOf("110T", "106", "109"), 2, "97"),
        Question(30, "No calibration required form:", listOf("110T", "108", "109"), 1, "97"),
        Question(31, "Tool Hand out Form:", listOf("852A", "852B", "852C"), 0, "100"),
        Question(32, "Tool Return Form:", listOf("852A", "852B", "852C"), 1, "100")
        // ... more can be added easily
    )
}
