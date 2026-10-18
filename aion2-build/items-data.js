/* AION 2 equippable items, item level 40 and up, from the Metaroad database (https://metaroad.gg/aion2/database),
   which reads the Global game client. Used with permission of the Metaroad owner. Exported 2026-10-18.
   Item level = the item's own level; the character's Item Level (Gear Score) is the sum over all 20 slots of
   (item level + enhancement). Refresh: see docs/items.md. Format is parsed by BA.parseItems in core.js. */
(function (root) {
  var RAW = `# families (armor sets: one line covers every armor slot listed): name|itemLevel|faction(l=Elyos,d=Asmodian,a=all)|grade|source|num|suffix|trade|slots|icon
Splendent Wise Dragon Lord|102|l|u|craftdraconiccombo|003a|s|s|*|GM_0005_T05
Splendent Ebony Dragon Lord|102|d|u|craftdraconiccombo|003a|s|s|*|GM_0005_T05
Wise Dragon Lord|94|l|u|craftdraconic|003a|s|s|*|GM_0005_T05
Ebony Dragon Lord|94|d|u|craftdraconic|003a|s|s|*|GM_0005_T05
Splendent White Dragon Lord|86|l|u|craftdraconiccombo|002a|s|s|*|GM_0060_T06
Splendent Dark Dragon Lord|86|d|u|craftdraconiccombo|002a|s|s|*|GM_0060_T06
Guardian Lord Nahma|86|a|u|dropboss|001a|s|s|*|GM_0045_T05
Nuakum|86|a|u|dropparty1|011a|s|n|*|GM_Idris_01
Abyssal|86|a|u|dropraid|001a|s|n|*|GM_0108_T04
White Dragon Lord|78|l|u|craftdraconic|002a|s|s|*|GM_0060_T06
Dark Dragon Lord|78|d|u|craftdraconic|002a|s|s|*|GM_0060_T06
Splendent True Dragon Lord|70|l|u|craftdraconiccombo|001a|s|s|*|GM_0061_T05
Splendent Star Dragon Lord|70|d|u|craftdraconiccombo|001a|s|s|*|GM_0061_T05
Vakron|70|a|u|dropparty1|010a|s|n|*|GM_0028_T05
Gartua|70|a|u|dropboss|003a|s|s|*|GM_0007_T05
Argo|70|a|u|dropboss|005a|s|s|*|GM_0044_T06
True Dragon Lord|62|l|u|craftdraconic|001a|s|s|*|GM_0061_T05
Star Dragon Lord|62|d|u|craftdraconic|001a|s|s|*|GM_0061_T05
Kaira|56|a|u|dropboss|004a|s|s|boots,cape,gloves,helmet,pants,shoulder|GM_0012_T04
Kaira|62|a|u|dropboss|004a|s|s|torso|GM_0012_T04
Bakarma|54|a|u|dropparty1|002a|s|n|*|GM_0059_T05
Conquering|51|a|u|dropabyss|005a|s|s|*|GM_0096_T04
Fallen Ancient God|46|a|u|dropabyss|004a|s|s|*|GM_0008_T05
Dartan|46|a|u|dropboss|002a|s|s|*|GM_0041_T04
Kashapa|46|a|u|dropboss|006a|s|s|*|GM_0068_T05
High Commander Lagta|46|a|u|dropboss|007a|s|s|*|GM_0062_T06
Corrupted Judicator|45|a|l|dropparty1|007a|s|n|*|GM_Kromede_01
Black Claw|45|a|l|dropparty1|013a|s|n|*|GM_0042_T04
Lunatic|45|a|l|dropraid|001a|s|n|*|GM_0043_T05
Artisan's Splendent Orichalcum|44|l|u|craftcombo|001a|s|s|*|GM_0148_T03
Artisan's Splendent Orichalcum|44|d|u|craftcombo|001a|s|s|*|GM_0148_T03
Pact-Bound|43|a|l|dropabyss|005a|s|s|*|GM_0027_T05
Transcendent|43|a|u|dropparty1|001a|s|n|*|GM_0046_T05
Divine Canyon|42|a|l|dropparty1|006a|s|n|*|GM_0072_T05
Unyielding|42|a|l|dropparty1|012a|s|n|*|GM_0049_T05
Holy Spirit|41|l|u|drop|002a|s|s|*|GM_0149_T03
Spectral|41|d|u|drop|002a|s|s|*|GM_0149_T03
Courage|41|a|u|dropabyss|003a|s|s|*|GM_0011_T05
Pilgrim|41|l|l|quest|002a|b|n|helmet,shoulder|GM_0019_T04
Liberator|41|d|l|quest|002a|b|n|helmet,shoulder|GM_0019_T04
Pilgrim|40|l|l|quest|002a|b|n|cape|GM_0019_T04
Liberator|40|d|l|quest|002a|b|n|cape|GM_0019_T04
Anguish|40|a|l|dropparty1|004a|s|n|*|GM_0032_T05
Division|40|a|l|dropparty1|005a|s|n|*|GM_0139_T05
Kusan|40|l|l|dropboss|001a|s|s|*|GM_0122_T01
Garshim|40|l|l|dropboss|002a|s|s|*|GM_DebGuard_03
Pnyn|40|l|l|dropboss|003a|s|s|*|GM_0094_T03
Saursus|40|l|l|dropboss|004a|s|s|*|GM_0098_T02
Aulla|40|l|l|dropboss|005a|s|s|*|GM_0164_T03
Taulo|40|l|l|dropboss|006a|s|s|*|GM_0146_T03
Aullamu|40|l|l|dropboss|007a|s|s|*|GM_0014_T03
Layla|40|l|l|dropboss|008a|s|s|*|GM_0054_T03
Lawa|40|l|l|dropboss|009a|s|s|*|GM_0023_T04
Demiros|40|l|l|dropboss|010a|s|s|*|GM_Ulgorn_01
Ansas|40|l|l|dropboss|011a|s|s|*|GM_0021_T03
Moshav|40|l|l|dropboss|012a|s|s|*|GM_0093_T04
K'nash|40|l|l|dropboss|013a|s|s|*|GM_0016_T05
Setram|40|l|l|dropboss|014a|s|s|*|GM_DebGuard_01
Kasia|40|l|l|dropboss|015a|s|s|*|GM_0137_T03
Garsan|40|d|l|dropboss|002a|s|s|*|GM_0106_T04
Trid|40|d|l|dropboss|003a|s|s|*|GM_0095_T02
Kelpina|40|d|l|dropboss|004a|s|s|*|GM_0097_T03
Nutah|40|d|l|dropboss|005a|s|s|*|GM_0036_T04
Resana|40|d|l|dropboss|006a|s|s|*|GM_0017_T02
Linx|40|d|l|dropboss|007a|s|s|*|GM_DebGuard_02
Newbold|40|d|l|dropboss|008a|s|s|*|GM_0013_T03
Axios|40|d|l|dropboss|009a|s|s|*|GM_0109_T04
Hardirun|40|d|l|dropboss|010a|s|s|*|GM_0056_T03
Barthien|40|d|l|dropboss|011a|s|s|*|GM_0002_T04
Guruta|40|d|l|dropboss|012a|s|s|*|GM_0015_T03
Shujakan|40|d|l|dropboss|013a|s|s|*|GM_0031_T05
Karuka|40|d|l|dropboss|014a|s|s|*|GM_0035_T05
Vishwada|40|d|l|dropboss|015a|s|s|*|GM_0006_T05
Shylak|40|d|l|dropboss|016a|s|s|*|GM_0113_T04
# items: code|name|itemLevel|trade|icon
wp_sword_a_e_dropraid_001a_s|Ludra's Scale Sword|102|n|WP_SW_0108_T06
wp_sword_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Longsword|102|s|WP_SW_0100_T06
wp_sword_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Longsword|102|s|WP_SW_0100_T06
wp_sword_l_u_craftdraconic_003a_s|Wise Dragon Lord Longsword|94|s|WP_SW_0100_T06
wp_sword_d_u_craftdraconic_003a_s|Ebony Dragon Lord Longsword|94|s|WP_SW_0100_T06
wp_sword_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Longsword|86|s|WP_SW_0068_T05
wp_sword_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Longsword|86|s|WP_SW_0068_T05
wp_sword_a_u_dropparty1_005a_s|Enraged Kromede Sword|86|n|WP_SW_0041_T06
wp_sword_a_u_dropraid_001a_s|Abyssal Longsword|86|n|WP_SW_0086_T06
wp_sword_l_u_craftdraconic_002a_s|White Dragon Lord Longsword|78|s|WP_SW_0068_T05
wp_sword_d_u_craftdraconic_002a_s|Dark Dragon Lord Longsword|78|s|WP_SW_0068_T05
wp_sword_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Longsword|70|s|WP_SW_0036_T05
wp_sword_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Longsword|70|s|WP_SW_0036_T05
wp_sword_a_u_dropparty1_004a_s|Aulamus Longsword|70|n|WP_SW_0028_T05
wp_sword_l_u_craftdraconic_001a_s|True Dragon Lord Longsword|62|s|WP_SW_0036_T05
wp_sword_d_u_craftdraconic_001a_s|Star Dragon Lord Longsword|62|s|WP_SW_0036_T05
wp_sword_a_u_dropparty1_003a_s|Rupture Sword|54|n|WP_SW_0031_T06
wp_sword_a_u_dropabyss_005a_s|Deadly Instrument|51|s|WP_SW_0030_T05
wp_sword_a_u_dropabyss_004a_s|Fallen Ancient God Longsword|46|s|WP_SW_0078_T05
wp_sword_a_l_dropparty1_007a_s|Corrupted Judicator Longsword|45|n|WP_SW_0026_T05
wp_sword_a_l_dropparty1_013a_s|Black Claw Longsword|45|n|WP_SW_0081_T05
wp_sword_a_l_dropraid_001a_s|Lunatic Longsword|45|n|WP_SW_0079_T05
wp_sword_l_u_quest_001a_b|Spiritforged Longsword|45|n|WP_SW_0078_T05
wp_sword_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Longsword|44|s|WP_SW_0064_T05
wp_sword_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Longsword|44|s|WP_SW_0064_T05
wp_sword_a_l_dropabyss_005a_s|Pact-Bound Longsword|43|s|WP_SW_0025_T04
wp_sword_a_u_dropparty1_001a_s|Kromede Sword|43|n|WP_SW_0056_T06
wp_sword_a_l_dropparty1_006a_s|Divine Canyon Longsword|42|n|WP_SW_0011_T03
wp_sword_a_l_dropparty1_012a_s|Unyielding Longsword|42|n|WP_SW_0084_T05
wp_sword_l_u_drop_003a_s|Holy Spirit Longsword|41|s|WP_SW_0058_T04
wp_sword_d_u_drop_003a_s|Spectral Longsword|41|s|WP_SW_0058_T04
wp_sword_a_u_dropabyss_003a_s|Courage Longsword|41|s|WP_SW_0065_T05
wp_sword_a_l_dropparty1_004a_s|Anguish Longsword|40|n|WP_SW_0059_T05
wp_sword_a_l_dropparty1_005a_s|Division Longsword|40|n|WP_SW_0017_T05
wp_bow_a_e_dropraid_001a_s|Ludra's Fatal Bow|102|n|WP_BW_0108_T06
wp_bow_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Bow|102|s|WP_BW_0100_T06
wp_bow_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Bow|102|s|WP_BW_0100_T06
wp_bow_l_u_craftdraconic_003a_s|Wise Dragon Lord Bow|94|s|WP_BW_0100_T06
wp_bow_d_u_craftdraconic_003a_s|Ebony Dragon Lord Bow|94|s|WP_BW_0100_T06
wp_bow_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Bow|86|s|WP_BW_0068_T05
wp_bow_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Bow|86|s|WP_BW_0068_T05
wp_bow_a_u_dropparty1_005a_s|Enraged Kromede Longbow|86|n|WP_BW_0041_T06
wp_bow_a_u_dropraid_001a_s|Abyssal Bow|86|n|WP_BW_0086_T06
wp_bow_l_u_craftdraconic_002a_s|White Dragon Lord Bow|78|s|WP_BW_0068_T05
wp_bow_d_u_craftdraconic_002a_s|Dark Dragon Lord Bow|78|s|WP_BW_0068_T05
wp_bow_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Bow|70|s|WP_BW_0036_T05
wp_bow_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Bow|70|s|WP_BW_0036_T05
wp_bow_a_u_dropparty1_004a_s|Aulamus Bow|70|n|WP_BW_0028_T05
wp_bow_l_u_craftdraconic_001a_s|True Dragon Lord Bow|62|s|WP_BW_0036_T05
wp_bow_d_u_craftdraconic_001a_s|Star Dragon Lord Bow|62|s|WP_BW_0036_T05
wp_bow_a_u_dropparty1_003a_s|Rupture Longbow|54|n|WP_BW_0031_T06
wp_bow_a_u_dropabyss_005a_s|Sky Messenger|51|s|WP_BW_0030_T05
wp_bow_a_u_dropabyss_004a_s|Fallen Ancient God Bow|46|s|WP_BW_0078_T05
wp_bow_a_l_dropparty1_007a_s|Corrupted Judicator Bow|45|n|WP_BW_0026_T05
wp_bow_a_l_dropparty1_013a_s|Black Claw Bow|45|n|WP_BW_0081_T05
wp_bow_a_l_dropraid_001a_s|Lunatic Bow|45|n|WP_BW_0079_T05
wp_bow_l_u_quest_001a_b|Spiritforged Bow|45|n|WP_BW_0078_T05
wp_bow_l_u_craftcombo_001a_s|Artisan's Splendent Yggdrasil Bow|44|s|WP_BW_0064_T05
wp_bow_d_u_craftcombo_001a_s|Artisan's Splendent Asvata Bow|44|s|WP_BW_0064_T05
wp_bow_a_l_dropabyss_005a_s|Pact-Bound Bow|43|s|WP_BW_0025_T04
wp_bow_a_u_dropparty1_001a_s|Kromede Longbow|43|n|WP_BW_0056_T06
wp_bow_a_l_dropparty1_006a_s|Divine Canyon Bow|42|n|WP_BW_0011_T03
wp_bow_a_l_dropparty1_012a_s|Unyielding Bow|42|n|WP_BW_0084_T05
wp_bow_l_u_drop_003a_s|Holy Spirit Bow|41|s|WP_BW_0058_T04
wp_bow_d_u_drop_003a_s|Spectral Bow|41|s|WP_BW_0058_T04
wp_bow_a_u_dropabyss_003a_s|Courage Bow|41|s|WP_BW_0065_T05
wp_bow_a_l_dropparty1_004a_s|Anguish Bow|40|n|WP_BW_0059_T05
wp_bow_a_l_dropparty1_005a_s|Division Bow|40|n|WP_BW_0017_T05
wp_dagger_a_e_dropraid_001a_s|Ludra's Claw|102|n|WP_DA_0108_T06
wp_dagger_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Dagger|102|s|WP_DA_0100_T06
wp_dagger_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Dagger|102|s|WP_DA_0100_T06
wp_dagger_l_u_craftdraconic_003a_s|Wise Dragon Lord Dagger|94|s|WP_DA_0100_T06
wp_dagger_d_u_craftdraconic_003a_s|Ebony Dragon Lord Dagger|94|s|WP_DA_0100_T06
wp_dagger_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Dagger|86|s|WP_DA_0068_T05
wp_dagger_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Dagger|86|s|WP_DA_0068_T05
wp_dagger_a_u_dropparty1_005a_s|Enraged Kromede Silver Dagger|86|n|WP_DA_0041_T06
wp_dagger_a_u_dropraid_001a_s|Abyssal Dagger|86|n|WP_DA_0086_T06
wp_dagger_l_u_craftdraconic_002a_s|White Dragon Lord Dagger|78|s|WP_DA_0068_T05
wp_dagger_d_u_craftdraconic_002a_s|Dark Dragon Lord Dagger|78|s|WP_DA_0068_T05
wp_dagger_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Dagger|70|s|WP_DA_0036_T05
wp_dagger_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Dagger|70|s|WP_DA_0036_T05
wp_dagger_a_u_dropparty1_004a_s|Aulamus Dagger|70|n|WP_DA_0028_T05
wp_dagger_l_u_craftdraconic_001a_s|True Dragon Lord Dagger|62|s|WP_DA_0036_T05
wp_dagger_d_u_craftdraconic_001a_s|Star Dragon Lord Dagger|62|s|WP_DA_0036_T05
wp_dagger_a_u_dropparty1_003a_s|Rupture Knife|54|n|WP_DA_0031_T06
wp_dagger_a_u_dropabyss_005a_s|Resentful Pain|51|s|WP_DA_0030_T05
wp_dagger_a_u_dropabyss_004a_s|Fallen Ancient God Dagger|46|s|WP_DA_0078_T05
wp_dagger_a_l_dropparty1_007a_s|Corrupted Judicator Dagger|45|n|WP_DA_0026_T05
wp_dagger_a_l_dropparty1_013a_s|Black Claw Dagger|45|n|WP_DA_0081_T05
wp_dagger_a_l_dropraid_001a_s|Lunatic Dagger|45|n|WP_DA_0079_T05
wp_dagger_l_u_quest_001a_b|Spiritforged Dagger|45|n|WP_DA_0078_T05
wp_dagger_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Dagger|44|s|WP_DA_0064_T05
wp_dagger_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Dagger|44|s|WP_DA_0064_T05
wp_dagger_a_l_dropabyss_005a_s|Pact-Bound Dagger|43|s|WP_DA_0025_T04
wp_dagger_a_u_dropparty1_001a_s|Kromede Silver Dagger|43|n|WP_DA_0056_T06
wp_dagger_a_l_dropparty1_006a_s|Divine Canyon Dagger|42|n|WP_DA_0011_T03
wp_dagger_a_l_dropparty1_012a_s|Unyielding Dagger|42|n|WP_DA_0084_T05
wp_dagger_l_u_drop_003a_s|Holy Spirit Knife|41|s|WP_DA_0058_T04
wp_dagger_d_u_drop_003a_s|Spectral Knife|41|s|WP_DA_0058_T04
wp_dagger_a_u_dropabyss_003a_s|Courage Dagger|41|s|WP_DA_0065_T05
wp_dagger_a_l_dropparty1_004a_s|Anguish Dagger|40|n|WP_DA_0059_T05
wp_dagger_a_l_dropparty1_005a_s|Division Dagger|40|n|WP_DA_0017_T05
wp_greatsword_a_e_dropraid_001a_s|Ludra's Blade of Extinction|102|n|WP_GS_0108_T06
wp_greatsword_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Greatsword|102|s|WP_GS_0100_T06
wp_greatsword_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Greatsword|102|s|WP_GS_0100_T06
wp_greatsword_l_u_craftdraconic_003a_s|Wise Dragon Lord Greatsword|94|s|WP_GS_0100_T06
wp_greatsword_d_u_craftdraconic_003a_s|Ebony Dragon Lord Greatsword|94|s|WP_GS_0100_T06
wp_greatsword_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Greatsword|86|s|WP_GS_0068_T05
wp_greatsword_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Greatsword|86|s|WP_GS_0068_T05
wp_greatsword_a_u_dropparty1_005a_s|Enraged Kromede Claymore|86|n|WP_GS_0041_T06
wp_greatsword_a_u_dropraid_001a_s|Abyssal Claymore|86|n|WP_GS_0086_T06
wp_greatsword_l_u_craftdraconic_002a_s|White Dragon Lord Greatsword|78|s|WP_GS_0068_T05
wp_greatsword_d_u_craftdraconic_002a_s|Dark Dragon Lord Greatsword|78|s|WP_GS_0068_T05
wp_greatsword_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Greatsword|70|s|WP_GS_0036_T05
wp_greatsword_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Greatsword|70|s|WP_GS_0036_T05
wp_greatsword_a_u_dropparty1_004a_s|Aulamus Greatsword|70|n|WP_GS_0028_T05
wp_greatsword_l_u_craftdraconic_001a_s|True Dragon Lord Greatsword|62|s|WP_GS_0036_T05
wp_greatsword_d_u_craftdraconic_001a_s|Star Dragon Lord Greatsword|62|s|WP_GS_0036_T05
wp_greatsword_a_u_dropparty1_003a_s|Rupture Claymore|54|n|WP_GS_0031_T06
wp_greatsword_a_u_dropabyss_005a_s|Earthly Authority|51|s|WP_GS_0030_T05
wp_greatsword_a_u_dropabyss_004a_s|Fallen Ancient God Greatsword|46|s|WP_GS_0078_T05
wp_greatsword_a_l_dropparty1_007a_s|Corrupted Judicator Greatsword|45|n|WP_GS_0026_T05
wp_greatsword_a_l_dropparty1_013a_s|Black Claw Greatsword|45|n|WP_GS_0081_T05
wp_greatsword_a_l_dropraid_001a_s|Lunatic Greatsword|45|n|WP_GS_0079_T05
wp_greatsword_l_u_quest_001a_b|Spiritforged Greatsword|45|n|WP_GS_0078_T05
wp_greatsword_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Greatsword|44|s|WP_GS_0064_T05
wp_greatsword_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Greatsword|44|s|WP_GS_0064_T05
wp_greatsword_a_l_dropabyss_005a_s|Pact-Bound Greatsword|43|s|WP_GS_0025_T04
wp_greatsword_a_u_dropparty1_001a_s|Kromede Claymore|43|n|WP_GS_0056_T06
wp_greatsword_a_l_dropparty1_006a_s|Divine Canyon Greatsword|42|n|WP_GS_0011_T03
wp_greatsword_a_l_dropparty1_012a_s|Unyielding Greatsword|42|n|WP_GS_0084_T05
wp_greatsword_l_u_drop_003a_s|Holy Spirit Greatsword|41|s|WP_GS_0058_T04
wp_greatsword_d_u_drop_003a_s|Spectral Greatsword|41|s|WP_GS_0058_T04
wp_greatsword_a_u_dropabyss_003a_s|Courage Greatsword|41|s|WP_GS_0065_T05
wp_greatsword_a_l_dropparty1_004a_s|Anguish Greatsword|40|n|WP_GS_0059_T05
wp_greatsword_a_l_dropparty1_005a_s|Division Greatsword|40|n|WP_GS_0017_T05
wp_guarder_a_e_dropraid_001a_s|Ludra's Heart|102|n|Weapon_Guarder_U_010
wp_guarder_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Guard|102|s|Weapon_Guarder_U_013
wp_guarder_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Guard|102|s|Weapon_Guarder_U_013
wp_guarder_l_u_craftdraconic_003a_s|Wise Dragon Lord Guard|94|s|Weapon_Guarder_U_013
wp_guarder_d_u_craftdraconic_003a_s|Ebony Dragon Lord Guard|94|s|Weapon_Guarder_U_013
wp_guarder_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Guard|86|s|Weapon_Guarder_U_005
wp_guarder_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Guard|86|s|Weapon_Guarder_U_005
wp_guarder_a_u_dropparty1_011a_s|Nuakum Guard|86|n|Weapon_Guarder_L_012
wp_guarder_a_u_dropraid_001a_s|Abyssal Guard|86|n|Weapon_Guarder_U_009
wp_guarder_l_u_craftdraconic_002a_s|White Dragon Lord Guard|78|s|Weapon_Guarder_U_005
wp_guarder_d_u_craftdraconic_002a_s|Dark Dragon Lord Guard|78|s|Weapon_Guarder_U_005
wp_guarder_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Guard|70|s|Weapon_Guarder_R_032
wp_guarder_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Guard|70|s|Weapon_Guarder_R_032
wp_guarder_a_u_dropparty1_010a_s|Vakron Guard|70|n|Weapon_Guarder_U_003
wp_guarder_l_u_craftdraconic_001a_s|True Dragon Lord Guard|62|s|Weapon_Guarder_R_032
wp_guarder_d_u_craftdraconic_001a_s|Star Dragon Lord Guard|62|s|Weapon_Guarder_R_032
wp_guarder_a_u_dropparty1_002a_s|Bakarma Guard|54|n|Weapon_Guarder_L_011
wp_guarder_a_u_dropabyss_005a_s|Unyielding Spirit|51|s|Weapon_Guarder_R_030
wp_guarder_a_u_dropabyss_004a_s|Fallen Ancient God Guard|46|s|Weapon_Guarder_R_011
wp_guarder_l_u_quest_001a_b|Spiritforged Guard|45|n|Weapon_Guarder_L_001
wp_guarder_a_l_dropparty1_007a_s|Ignus Guard|45|n|Weapon_Guarder_L_006
wp_guarder_a_l_dropparty1_013a_s|Black Claw Guard|45|n|Weapon_Guarder_C_015
wp_guarder_a_l_dropraid_001a_s|Lunatic Guard|45|n|Weapon_Guarder_R_041
wp_guarder_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Guard|44|s|Weapon_Guarder_R_036
wp_guarder_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Guard|44|s|Weapon_Guarder_R_036
wp_guarder_a_l_dropabyss_005a_s|Pact-Bound Guard|43|s|Weapon_Guarder_R_016
wp_guarder_a_u_dropparty1_001a_s|Transcendent Guard|43|n|Weapon_Guarder_U_006
wp_guarder_a_l_dropparty1_006a_s|Turbulence Guard|42|n|Weapon_Guarder_L_005
wp_guarder_a_l_dropparty1_012a_s|Unyielding Guard|42|n|Weapon_Guarder_L_007
wp_guarder_l_u_drop_003a_s|Holy Spirit Guard|41|s|Weapon_Guarder_L_018
wp_guarder_d_u_drop_003a_s|Spectral Guard|41|s|Weapon_Guarder_L_018
wp_guarder_a_u_dropabyss_003a_s|Courage Guard|41|s|Weapon_Guarder_R_020
wp_guarder_a_l_dropparty1_004a_s|Anguish Guard|40|n|Weapon_Guarder_L_002
wp_guarder_a_l_dropparty1_005a_s|Sealed Will|40|n|Weapon_Guarder_R_007
wp_mace_a_e_dropraid_001a_s|Ludra's Fatal Mace|102|n|WP_MA_0108_T06
wp_mace_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Mace|102|s|WP_MA_0100_T06
wp_mace_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Mace|102|s|WP_MA_0100_T06
wp_mace_l_u_craftdraconic_003a_s|Wise Dragon Lord Mace|94|s|WP_MA_0100_T06
wp_mace_d_u_craftdraconic_003a_s|Ebony Dragon Lord Mace|94|s|WP_MA_0100_T06
wp_mace_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Mace|86|s|WP_MA_0068_T05
wp_mace_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Mace|86|s|WP_MA_0068_T05
wp_mace_a_u_dropparty1_005a_s|Enraged Kromede Warhammer|86|n|WP_MA_0041_T06
wp_mace_a_u_dropraid_001a_s|Abyssal Mace|86|n|WP_MA_0086_T06
wp_mace_l_u_craftdraconic_002a_s|White Dragon Lord Mace|78|s|WP_MA_0068_T05
wp_mace_d_u_craftdraconic_002a_s|Dark Dragon Lord Mace|78|s|WP_MA_0068_T05
wp_mace_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Mace|70|s|WP_MA_0036_T05
wp_mace_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Mace|70|s|WP_MA_0036_T05
wp_mace_a_u_dropparty1_004a_s|Aulamus Mace|70|n|WP_MA_0028_T05
wp_mace_l_u_craftdraconic_001a_s|True Dragon Lord Mace|62|s|WP_MA_0036_T05
wp_mace_d_u_craftdraconic_001a_s|Star Dragon Lord Mace|62|s|WP_MA_0036_T05
wp_mace_a_u_dropparty1_003a_s|Rupture Warhammer|54|n|WP_MA_0031_T06
wp_mace_a_u_dropabyss_005a_s|Infinite Potential|51|s|WP_MA_0030_T05
wp_mace_a_u_dropabyss_004a_s|Fallen Ancient God Mace|46|s|WP_MA_0078_T05
wp_mace_a_l_dropparty1_007a_s|Corrupted Judicator Mace|45|n|WP_MA_0026_T05
wp_mace_a_l_dropparty1_013a_s|Black Claw Mace|45|n|WP_MA_0081_T05
wp_mace_a_l_dropraid_001a_s|Lunatic Mace|45|n|WP_MA_0079_T05
wp_mace_l_u_quest_001a_b|Spiritforged Mace|45|n|WP_MA_0078_T05
wp_mace_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Mace|44|s|WP_MA_0064_T05
wp_mace_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Mace|44|s|WP_MA_0064_T05
wp_mace_a_l_dropabyss_005a_s|Pact-Bound Mace|43|s|WP_MA_0025_T04
wp_mace_a_u_dropparty1_001a_s|Kromede Warhammer|43|n|WP_MA_0056_T06
wp_mace_a_l_dropparty1_006a_s|Divine Canyon Mace|42|n|WP_MA_0011_T03
wp_mace_a_l_dropparty1_012a_s|Unyielding Mace|42|n|WP_MA_0084_T05
wp_mace_l_u_drop_003a_s|Holy Spirit Mace|41|s|WP_MA_0058_T04
wp_mace_d_u_drop_003a_s|Spectral Mace|41|s|WP_MA_0058_T04
wp_mace_a_u_dropabyss_003a_s|Courage Mace|41|s|WP_MA_0065_T05
wp_mace_a_l_dropparty1_004a_s|Anguish Mace|40|n|WP_MA_0059_T05
wp_mace_a_l_dropparty1_005a_s|Division Mace|40|n|WP_MA_0017_T05
wp_magicbook_a_e_dropraid_001a_s|Ludra's Grimoire|102|n|WP_MB_0108_T06
wp_magicbook_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Spellbook|102|s|WP_MB_0100_T06
wp_magicbook_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Spellbook|102|s|WP_MB_0100_T06
wp_magicbook_l_u_craftdraconic_003a_s|Wise Dragon Lord Spellbook|94|s|WP_MB_0100_T06
wp_magicbook_d_u_craftdraconic_003a_s|Ebony Dragon Lord Spellbook|94|s|WP_MB_0100_T06
wp_magicbook_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Spellbook|86|s|WP_MB_0068_T05
wp_magicbook_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Spellbook|86|s|WP_MB_0068_T05
wp_magicbook_a_u_dropparty1_005a_s|Enraged Kromede Spellbook|86|n|WP_MB_0041_T06
wp_magicbook_a_u_dropraid_001a_s|Abyssal Spellbook|86|n|WP_MB_0086_T06
wp_magicbook_l_u_craftdraconic_002a_s|White Dragon Lord Spellbook|78|s|WP_MB_0068_T05
wp_magicbook_d_u_craftdraconic_002a_s|Dark Dragon Lord Spellbook|78|s|WP_MB_0068_T05
wp_magicbook_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Spellbook|70|s|WP_MB_0036_T05
wp_magicbook_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Spellbook|70|s|WP_MB_0036_T05
wp_magicbook_a_u_dropparty1_004a_s|Aulamus Spellbook|70|n|WP_MB_0028_T05
wp_magicbook_l_u_craftdraconic_001a_s|True Dragon Lord Spellbook|62|s|WP_MB_0036_T05
wp_magicbook_d_u_craftdraconic_001a_s|Star Dragon Lord Spellbook|62|s|WP_MB_0036_T05
wp_magicbook_a_u_dropparty1_003a_s|Rupture Tome|54|n|WP_MB_0031_T06
wp_magicbook_a_u_dropabyss_005a_s|Forbidden Truth|51|s|WP_MB_0030_T05
wp_magicbook_a_u_dropabyss_004a_s|Fallen Ancient God Spellbook|46|s|WP_MB_0078_T05
wp_magicbook_a_l_dropparty1_007a_s|Corrupted Judicator Spellbook|45|n|WP_MB_0026_T05
wp_magicbook_a_l_dropparty1_013a_s|Black Claw Spellbook|45|n|WP_MB_0081_T05
wp_magicbook_a_l_dropraid_001a_s|Lunatic Spellbook|45|n|WP_MB_0079_T05
wp_magicbook_l_u_quest_001a_b|Spiritforged Spellbook|45|n|WP_MB_0078_T05
wp_magicbook_l_u_craftcombo_001a_s|Artisan's Splendent Truth Spellbook|44|s|WP_MB_0064_T05
wp_magicbook_d_u_craftcombo_001a_s|Artisan's Splendent Truth Spellbook|44|s|WP_MB_0064_T05
wp_magicbook_a_l_dropabyss_005a_s|Pact-Bound Spellbook|43|s|WP_MB_0025_T04
wp_magicbook_a_u_dropparty1_001a_s|Kromede Spellbook|43|n|WP_MB_0056_T06
wp_magicbook_a_l_dropparty1_006a_s|Divine Canyon Spellbook|42|n|WP_MB_0011_T03
wp_magicbook_a_l_dropparty1_012a_s|Unyielding Spellbook|42|n|WP_MB_0084_T05
wp_magicbook_l_u_drop_003a_s|Holy Spirit Spellbook|41|s|WP_MB_0058_T04
wp_magicbook_d_u_drop_003a_s|Spectral Spellbook|41|s|WP_MB_0058_T04
wp_magicbook_a_u_dropabyss_003a_s|Courage Spellbook|41|s|WP_MB_0065_T05
wp_magicbook_a_l_dropparty1_004a_s|Anguish Spellbook|40|n|WP_MB_0059_T05
wp_magicbook_a_l_dropparty1_005a_s|Division Spellbook|40|n|WP_MB_0017_T05
wp_orb_a_e_dropraid_001a_s|Ludra's Abyssal Jade|102|n|WP_OR_0108_T06
wp_orb_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Orb|102|s|WP_OR_0100_T06
wp_orb_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Orb|102|s|WP_OR_0100_T06
wp_orb_l_u_craftdraconic_003a_s|Wise Dragon Lord Orb|94|s|WP_OR_0100_T06
wp_orb_d_u_craftdraconic_003a_s|Ebony Dragon Lord Orb|94|s|WP_OR_0100_T06
wp_orb_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Orb|86|s|WP_OR_0068_T05
wp_orb_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Orb|86|s|WP_OR_0068_T05
wp_orb_a_u_dropparty1_005a_s|Enraged Kromede Jewel|86|n|WP_OR_0041_T06
wp_orb_a_u_dropraid_001a_s|Abyssal Orb|86|n|WP_OR_0086_T06
wp_orb_l_u_craftdraconic_002a_s|White Dragon Lord Orb|78|s|WP_OR_0068_T05
wp_orb_d_u_craftdraconic_002a_s|Dark Dragon Lord Orb|78|s|WP_OR_0068_T05
wp_orb_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Orb|70|s|WP_OR_0036_T05
wp_orb_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Orb|70|s|WP_OR_0036_T05
wp_orb_a_u_dropparty1_004a_s|Aulamus Orb|70|n|WP_OR_0028_T05
wp_orb_l_u_craftdraconic_001a_s|True Dragon Lord Orb|62|s|WP_OR_0036_T05
wp_orb_d_u_craftdraconic_001a_s|Star Dragon Lord Orb|62|s|WP_OR_0036_T05
wp_orb_a_u_dropparty1_003a_s|Rupture Jewel|54|n|WP_OR_0031_T06
wp_orb_a_u_dropabyss_005a_s|Labyrinth's Heart|51|s|WP_OR_0030_T05
wp_orb_a_u_dropabyss_004a_s|Fallen Ancient God Orb|46|s|WP_OR_0078_T05
wp_orb_a_l_dropparty1_007a_s|Corrupted Judicator Orb|45|n|WP_OR_0026_T05
wp_orb_a_l_dropparty1_013a_s|Black Claw Orb|45|n|WP_OR_0081_T05
wp_orb_a_l_dropraid_001a_s|Lunatic Orb|45|n|WP_OR_0079_T05
wp_orb_l_u_quest_001a_b|Spiritforged Orb|45|n|WP_OR_0078_T05
wp_orb_l_u_craftcombo_001a_s|Artisan's Splendent Truth Orb|44|s|WP_OR_0064_T05
wp_orb_d_u_craftcombo_001a_s|Artisan's Splendent Truth Orb|44|s|WP_OR_0064_T05
wp_orb_a_l_dropabyss_005a_s|Pact-Bound Orb|43|s|WP_OR_0025_T04
wp_orb_a_u_dropparty1_001a_s|Kromede Jewel|43|n|WP_OR_0056_T06
wp_orb_a_l_dropparty1_006a_s|Divine Canyon Orb|42|n|WP_OR_0011_T03
wp_orb_a_l_dropparty1_012a_s|Unyielding Orb|42|n|WP_OR_0084_T05
wp_orb_l_u_drop_003a_s|Holy Spirit Orb|41|s|WP_OR_0058_T04
wp_orb_d_u_drop_003a_s|Spectral Orb|41|s|WP_OR_0058_T04
wp_orb_a_u_dropabyss_003a_s|Courage Orb|41|s|WP_OR_0065_T05
wp_orb_a_l_dropparty1_004a_s|Anguish Orb|40|n|WP_OR_0059_T05
wp_orb_a_l_dropparty1_005a_s|Division Orb|40|n|WP_OR_0017_T05
wp_staff_a_e_dropraid_001a_s|Ludra's Heavenbound Staff|102|n|WP_ST_0108_T06
wp_staff_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Staff|102|s|WP_ST_0100_T06
wp_staff_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Staff|102|s|WP_ST_0100_T06
wp_staff_l_u_craftdraconic_003a_s|Wise Dragon Lord Staff|94|s|WP_ST_0100_T06
wp_staff_d_u_craftdraconic_003a_s|Ebony Dragon Lord Staff|94|s|WP_ST_0100_T06
wp_staff_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Staff|86|s|WP_ST_0068_T05
wp_staff_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Staff|86|s|WP_ST_0068_T05
wp_staff_a_u_dropparty1_005a_s|Enraged Kromede Rod|86|n|WP_ST_0041_T06
wp_staff_a_u_dropraid_001a_s|Abyssal Staff|86|n|WP_ST_0086_T06
wp_staff_l_u_craftdraconic_002a_s|White Dragon Lord Staff|78|s|WP_ST_0068_T05
wp_staff_d_u_craftdraconic_002a_s|Dark Dragon Lord Staff|78|s|WP_ST_0068_T05
wp_staff_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Staff|70|s|WP_ST_0036_T05
wp_staff_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Staff|70|s|WP_ST_0036_T05
wp_staff_a_u_dropparty1_004a_s|Aulamus Staff|70|n|WP_ST_0028_T05
wp_staff_l_u_craftdraconic_001a_s|True Dragon Lord Staff|62|s|WP_ST_0036_T05
wp_staff_d_u_craftdraconic_001a_s|Star Dragon Lord Staff|62|s|WP_ST_0036_T05
wp_staff_a_u_dropparty1_003a_s|Rupture Rod|54|n|WP_ST_0031_T06
wp_staff_a_u_dropabyss_005a_s|Overwhelming Support|51|s|WP_ST_0030_T05
wp_staff_a_u_dropabyss_004a_s|Fallen Ancient God Staff|46|s|WP_ST_0078_T05
wp_staff_a_l_dropparty1_007a_s|Corrupted Judicator Staff|45|n|WP_ST_0026_T05
wp_staff_a_l_dropparty1_013a_s|Black Claw Staff|45|n|WP_ST_0081_T05
wp_staff_a_l_dropraid_001a_s|Lunatic Staff|45|n|WP_ST_0079_T05
wp_staff_l_u_quest_001a_b|Spiritforged Staff|45|n|WP_ST_0078_T05
wp_staff_l_u_craftcombo_001a_s|Artisan's Splendent Yggdrasil Staff|44|s|WP_ST_0064_T05
wp_staff_d_u_craftcombo_001a_s|Artisan's Splendent Asvata Staff|44|s|WP_ST_0064_T05
wp_staff_a_l_dropabyss_005a_s|Pact-Bound Staff|43|s|WP_ST_0025_T04
wp_staff_a_u_dropparty1_001a_s|Kromede Rod|43|n|WP_ST_0056_T06
wp_staff_a_l_dropparty1_006a_s|Divine Canyon Staff|42|n|WP_ST_0011_T03
wp_staff_a_l_dropparty1_012a_s|Unyielding Staff|42|n|WP_ST_0084_T05
wp_staff_l_u_drop_003a_s|Holy Spirit Staff|41|s|WP_ST_0058_T04
wp_staff_d_u_drop_003a_s|Spectral Staff|41|s|WP_ST_0058_T04
wp_staff_a_u_dropabyss_003a_s|Courage Staff|41|s|WP_ST_0065_T05
wp_staff_a_l_dropparty1_004a_s|Anguish Staff|40|n|WP_ST_0059_T05
wp_staff_a_l_dropparty1_005a_s|Division Staff|40|n|WP_ST_0017_T05
acc_earring_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Earrings|102|s|ACC_ER_0047
acc_earring_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Earrings|102|s|ACC_ER_0047
acc_earring_l_u_craftdraconic_003a_s|Wise Dragon Lord Earrings|94|s|ACC_ER_0047
acc_earring_d_u_craftdraconic_003a_s|Ebony Dragon Lord Earrings|94|s|ACC_ER_0047
acc_earring_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Earrings|86|s|ACC_ER_0035
acc_earring_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Earrings|86|s|ACC_ER_0035
acc_earring_a_u_dropparty1_005a_s|Enraged Kromede Earrings|86|n|ACC_ER_0053
acc_earring_a_u_dropboss_001a_s|Guardian Lord Nahma Earrings|86|s|ACC_ER_0067
acc_earring_a_u_dropraid_001a_s|Abyssal Earrings|86|n|ACC_ER_Sun_02
acc_earring_l_u_craftdraconic_002a_s|White Dragon Lord Earrings|78|s|ACC_ER_0035
acc_earring_d_u_craftdraconic_002a_s|Dark Dragon Lord Earrings|78|s|ACC_ER_0035
acc_earring_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Earrings|70|s|ACC_ER_0036
acc_earring_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Earrings|70|s|ACC_ER_0036
acc_earring_a_u_dropparty1_004a_s|Aulamus Earrings|70|n|ACC_ER_0072
acc_earring_a_u_dropboss_008a_s|Gartua Earrings|70|s|ACC_ER_0064
acc_earring_a_u_dropboss_010a_s|Argo Earrings|70|s|ACC_ER_0031
acc_earring_l_u_craftdraconic_001a_s|True Dragon Lord Earrings|62|s|ACC_ER_0036
acc_earring_d_u_craftdraconic_001a_s|Star Dragon Lord Earrings|62|s|ACC_ER_0036
acc_earring_a_u_dropboss_009a_s|Kaira Earrings|56|s|ACC_ER_0032
acc_earring_a_u_dropparty1_003a_s|Berk Earrings|54|n|ACC_ER_0066
acc_earring_a_u_dropabyss_005a_s|Conquering Diamond Earrings|51|s|ACC_ER_0044
acc_earring_a_u_dropabyss_004a_s|Fallen Ancient God Diamond Earrings|46|s|ACC_ER_0009
acc_earring_a_u_dropboss_006a_s|Dartan Earrings|46|s|ACC_ER_0058
acc_earring_a_u_dropboss_011a_s|Kashapa Earrings|46|s|ACC_ER_0081
acc_earring_a_u_dropboss_012a_s|High Commander Lagta Earrings|46|s|ACC_ER_0077
acc_earring_a_l_dropparty1_007a_s|Murute Earrings|45|n|ACC_ER_0048
acc_earring_a_l_dropparty1_013a_s|Black Claw Earrings|45|n|ACC_ER_0057
acc_earring_l_u_craftcombo_001a_s|Artisan's Splendent Diamond Earrings|44|s|ACC_ER_0012
acc_earring_d_u_craftcombo_001a_s|Artisan's Splendent Diamond Earrings|44|s|ACC_ER_0012
acc_earring_a_l_dropabyss_005a_s|Pact-Bound Diamond Earrings|43|s|ACC_ER_0021
acc_earring_l_l_quest_002a_b|Pilgrim Earrings|43|n|ACC_ER_0071
acc_earring_d_l_quest_002a_b|Liberator Earrings|43|n|ACC_ER_0071
acc_earring_a_l_dropparty1_006a_s|Divine Canyon Earrings|42|n|ACC_ER_0019
acc_earring_a_l_dropparty1_012a_s|Unyielding Earrings|42|n|ACC_ER_0027
acc_earring_a_u_dropabyss_003a_s|Courage Diamond Earrings|41|s|ACC_ER_0084
acc_earring_a_l_dropparty1_004a_s|Saraswati Earrings|40|n|ACC_ER_0037
acc_earring_a_l_dropparty1_005a_s|Division Earrings|40|n|ACC_ER_0065
acc_ring_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Ring|102|s|ACC_Ring_0047
acc_ring_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Ring|102|s|ACC_Ring_0047
acc_ring_l_u_craftdraconic_003a_s|Wise Dragon Lord Ring|94|s|ACC_Ring_0047
acc_ring_d_u_craftdraconic_003a_s|Ebony Dragon Lord Ring|94|s|ACC_Ring_0047
acc_ring_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Ring|86|s|ACC_Ring_0035
acc_ring_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Ring|86|s|ACC_Ring_0035
acc_ring_a_u_dropparty1_005a_s|Enraged Kromede Ring|86|n|ACC_Ring_0053
acc_ring_a_u_dropboss_001a_s|Guardian Lord Nahma Ring|86|s|ACC_Ring_ring
acc_ring_a_u_dropraid_001a_s|Abyssal Ring|86|n|ACC_Ring_n_02
acc_ring_l_u_craftdraconic_002a_s|White Dragon Lord Ring|78|s|ACC_Ring_0035
acc_ring_d_u_craftdraconic_002a_s|Dark Dragon Lord Ring|78|s|ACC_Ring_0035
acc_ring_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Ring|70|s|ACC_Ring_0036
acc_ring_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Ring|70|s|ACC_Ring_0036
acc_ring_a_u_dropparty1_004a_s|Aulamus Ring|70|n|ACC_Ring_0072
acc_ring_a_u_dropboss_008a_s|Gartua Ring|70|s|ACC_Ring_0064
acc_ring_a_u_dropboss_010a_s|Argo Ring|70|s|ACC_Ring_0031
acc_ring_l_u_craftdraconic_001a_s|True Dragon Lord Ring|62|s|ACC_Ring_0036
acc_ring_d_u_craftdraconic_001a_s|Star Dragon Lord Ring|62|s|ACC_Ring_0036
acc_ring_a_u_dropboss_009a_s|Kaira Ring|56|s|ACC_Ring_0032
acc_ring_a_u_dropparty1_003a_s|Berk Ring|54|n|ACC_Ring_0066
acc_ring_a_u_dropabyss_005a_s|Conquering Sapphire Ring|51|s|ACC_Ring_0044
acc_ring_a_u_dropabyss_004a_s|Fallen Ancient God Sapphire Ring|46|s|ACC_Ring_0009
acc_ring_a_u_dropboss_006a_s|Dartan Ring|46|s|ACC_Ring_0058
acc_ring_a_u_dropboss_011a_s|Kashapa Ring|46|s|ACC_Ring_0081
acc_ring_a_u_dropboss_012a_s|High Commander Lagta Ring|46|s|ACC_Ring_0077
acc_ring_a_l_dropparty1_007a_s|Rotan Loop|45|n|ACC_Ring_PartyDungeon_003
acc_ring_a_l_dropparty1_013a_s|Black Claw Ring|45|n|ACC_Ring_0057
acc_ring_l_u_craftcombo_001a_s|Artisan's Splendent Sapphire Ring|44|s|ACC_Ring_0012
acc_ring_d_u_craftcombo_001a_s|Artisan's Splendent Sapphire Ring|44|s|ACC_Ring_0012
acc_ring_a_l_dropabyss_005a_s|Pact-Bound Sapphire Ring|43|s|ACC_Ring_0021
acc_ring_l_l_quest_002a_b|Pilgrim Ring|43|n|ACC_Ring_0071
acc_ring_d_l_quest_002a_b|Liberator Ring|43|n|ACC_Ring_0071
acc_ring_a_l_dropparty1_006a_s|Divine Canyon Ring|42|n|ACC_Ring_0019
acc_ring_a_l_dropparty1_012a_s|Wind Forest Ring|42|n|ACC_Ring_0027
acc_ring_a_u_dropabyss_003a_s|Courage Sapphire Ring|41|s|ACC_Ring_0084
acc_ring_a_l_dropparty1_004a_s|Anguish Ring|40|n|ACC_Ring_0037
acc_ring_a_l_dropparty1_005a_s|Division Ring|40|n|ACC_Ring_0065
acc_necklace_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Necklace|102|s|ACC_NL_0047
acc_necklace_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Necklace|102|s|ACC_NL_0047
acc_necklace_l_u_craftdraconic_003a_s|Wise Dragon Lord Necklace|94|s|ACC_NL_0047
acc_necklace_d_u_craftdraconic_003a_s|Ebony Dragon Lord Necklace|94|s|ACC_NL_0047
acc_necklace_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Necklace|86|s|ACC_NL_0035
acc_necklace_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Necklace|86|s|ACC_NL_0035
acc_necklace_a_u_dropparty1_005a_s|Enraged Kromede Necklace|86|n|ACC_NL_0053
acc_necklace_a_u_dropboss_001a_s|Guardian Lord Nahma Necklace|86|s|ACC_NL_0067
acc_necklace_a_u_dropraid_001a_s|Abyssal Necklace|86|n|ACC_NL_Sun_02
acc_necklace_l_u_craftdraconic_002a_s|White Dragon Lord Necklace|78|s|ACC_NL_0035
acc_necklace_d_u_craftdraconic_002a_s|Dark Dragon Lord Necklace|78|s|ACC_NL_0035
acc_necklace_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Necklace|70|s|ACC_NL_0036
acc_necklace_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Necklace|70|s|ACC_NL_0036
acc_necklace_a_u_dropparty1_004a_s|Aulamus Necklace|70|n|ACC_NL_0072
acc_necklace_a_u_dropboss_006a_s|Gartua Necklace|70|s|ACC_NL_0064
acc_necklace_a_u_dropboss_008a_s|Argo Necklace|70|s|ACC_NL_0031
acc_necklace_l_u_craftdraconic_001a_s|True Dragon Lord Necklace|62|s|ACC_NL_0036
acc_necklace_d_u_craftdraconic_001a_s|Star Dragon Lord Necklace|62|s|ACC_NL_0036
acc_necklace_a_u_dropboss_007a_s|Kaira Necklace|56|s|ACC_NL_0032
acc_necklace_a_u_dropparty1_003a_s|Berk Necklace|54|n|ACC_NL_0066
acc_necklace_a_u_dropabyss_005a_s|Conquering Ruby Necklace|51|s|ACC_NL_0044
acc_necklace_a_u_dropabyss_004a_s|Fallen Ancient God Ruby Necklace|46|s|ACC_NL_0009
acc_necklace_a_u_dropboss_004a_s|Dartan Necklace|46|s|ACC_NL_0058
acc_necklace_a_u_dropboss_009a_s|Kashapa Necklace|46|s|ACC_NL_0081
acc_necklace_a_u_dropboss_010a_s|High Commander Lagta Necklace|46|s|ACC_NL_0077
acc_necklace_a_l_dropparty1_007a_s|Corrupted Judicator Necklace|45|n|ACC_NL_0048
acc_necklace_a_l_dropparty1_013a_s|Fera Necklace|45|n|ACC_NL_0057
acc_necklace_l_u_craftcombo_001a_s|Artisan's Splendent Ruby Necklace|44|s|ACC_NL_0012
acc_necklace_d_u_craftcombo_001a_s|Artisan's Splendent Ruby Necklace|44|s|ACC_NL_0012
acc_necklace_a_l_dropabyss_005a_s|Pact-Bound Ruby Necklace|43|s|ACC_NL_0021
acc_necklace_l_l_quest_002a_b|Pilgrim Necklace|43|n|ACC_NL_0071
acc_necklace_d_l_quest_002a_b|Liberator Necklace|43|n|ACC_NL_0071
acc_necklace_a_l_dropparty1_006a_s|Divine Canyon Necklace|42|n|ACC_NL_0019
acc_necklace_a_l_dropparty1_012a_s|Unyielding Necklace|42|n|ACC_NL_0027
acc_necklace_a_u_dropabyss_003a_s|Courage Ruby Necklace|41|s|ACC_NL_0084
acc_necklace_a_l_dropparty1_004a_s|Lakshmi Necklace|40|n|ACC_NL_0037
acc_necklace_a_l_dropparty1_005a_s|Division Necklace|40|n|ACC_NL_0065
acc_bracelet_a_u_dropraid_001a_s|Abyssal Bracelet|86|n|ACC_Bracelet_n_02
acc_bracelet_l_u_quest_001a_b|Ascension Bracelet|51|n|Acc_Bracelet_R_027
acc_bracelet_l_l_quest_002a_b|Pilgrim Bracelet|43|n|ACC_Bracelet_0071
acc_bracelet_d_l_quest_002a_b|Liberator Bracelet|43|n|ACC_Bracelet_0071
etc_amulet_a_u_quest_001a_b|Revelation Amulet|65|n|Item_Craft_Conversion_Crystal_L_lv5_01
etc_amulet_a_u_quest_002a_b|Fierce Battle Amulet|65|n|Equip_EB_EmblemD_MI_abyssshop_L_u_003
etc_belt_a_u_quest_001a_b|Noble Belt|65|n|Acc_Belt_C_022
etc_rune_a_s_shopcoin2_001a_b|Clash Rune|40|n|Equip_ACC_Rune_R_002`;
  root.BA_ITEMS_RAW = RAW;
  root.BA_ITEMS_META = { iconBase: 'https://guosmhnujsowkrkvuoyn.supabase.co/storage/v1/object/public/aion2-assets/item-icons/Icon_', source: 'Metaroad', url: 'https://metaroad.gg/aion2/database/items', exported: '2026-10-18', minLevel: 40 };
  if (typeof module !== 'undefined' && module.exports) module.exports = { RAW: RAW, META: root.BA_ITEMS_META };
})(typeof window !== 'undefined' ? window : globalThis);
