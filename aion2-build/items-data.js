/* AION 2 equippable items, item level 40 and up, from the Metaroad database (https://metaroad.gg/aion2/database),
   which reads the Global game client. Used with permission of the Metaroad owner. Exported 2026-10-18.
   Item level = the item's own level; the character's Item Level (Gear Score) is the sum over all 20 slots of
   (item level + enhancement). Refresh: see docs/items.md. Format is parsed by BA.parseItems in core.js. */
(function (root) {
  var RAW = `# families (armor sets: one line covers every armor slot listed): name|itemLevel|faction(l=Elyos,d=Asmodian,a=all)|grade|source|num|suffix|trade|slots
Splendent Wise Dragon Lord|102|l|u|craftdraconiccombo|003a|s|s|*
Splendent Ebony Dragon Lord|102|d|u|craftdraconiccombo|003a|s|s|*
Wise Dragon Lord|94|l|u|craftdraconic|003a|s|s|*
Ebony Dragon Lord|94|d|u|craftdraconic|003a|s|s|*
Splendent White Dragon Lord|86|l|u|craftdraconiccombo|002a|s|s|*
Splendent Dark Dragon Lord|86|d|u|craftdraconiccombo|002a|s|s|*
Guardian Lord Nahma|86|a|u|dropboss|001a|s|s|*
Nuakum|86|a|u|dropparty1|011a|s|n|*
Abyssal|86|a|u|dropraid|001a|s|n|*
White Dragon Lord|78|l|u|craftdraconic|002a|s|s|*
Dark Dragon Lord|78|d|u|craftdraconic|002a|s|s|*
Splendent True Dragon Lord|70|l|u|craftdraconiccombo|001a|s|s|*
Splendent Star Dragon Lord|70|d|u|craftdraconiccombo|001a|s|s|*
Vakron|70|a|u|dropparty1|010a|s|n|*
Gartua|70|a|u|dropboss|003a|s|s|*
Argo|70|a|u|dropboss|005a|s|s|*
True Dragon Lord|62|l|u|craftdraconic|001a|s|s|*
Star Dragon Lord|62|d|u|craftdraconic|001a|s|s|*
Kaira|56|a|u|dropboss|004a|s|s|boots,cape,gloves,helmet,pants,shoulder
Kaira|62|a|u|dropboss|004a|s|s|torso
Bakarma|54|a|u|dropparty1|002a|s|n|*
Conquering|51|a|u|dropabyss|005a|s|s|*
Fallen Ancient God|46|a|u|dropabyss|004a|s|s|*
Dartan|46|a|u|dropboss|002a|s|s|*
Kashapa|46|a|u|dropboss|006a|s|s|*
High Commander Lagta|46|a|u|dropboss|007a|s|s|*
Corrupted Judicator|45|a|l|dropparty1|007a|s|n|*
Black Claw|45|a|l|dropparty1|013a|s|n|*
Lunatic|45|a|l|dropraid|001a|s|n|*
Artisan's Splendent Orichalcum|44|l|u|craftcombo|001a|s|s|*
Artisan's Splendent Orichalcum|44|d|u|craftcombo|001a|s|s|*
Pact-Bound|43|a|l|dropabyss|005a|s|s|*
Transcendent|43|a|u|dropparty1|001a|s|n|*
Divine Canyon|42|a|l|dropparty1|006a|s|n|*
Unyielding|42|a|l|dropparty1|012a|s|n|*
Holy Spirit|41|l|u|drop|002a|s|s|*
Spectral|41|d|u|drop|002a|s|s|*
Courage|41|a|u|dropabyss|003a|s|s|*
Pilgrim|41|l|l|quest|002a|b|n|helmet,shoulder
Liberator|41|d|l|quest|002a|b|n|helmet,shoulder
Pilgrim|40|l|l|quest|002a|b|n|cape
Liberator|40|d|l|quest|002a|b|n|cape
Anguish|40|a|l|dropparty1|004a|s|n|*
Division|40|a|l|dropparty1|005a|s|n|*
Kusan|40|l|l|dropboss|001a|s|s|*
Garshim|40|l|l|dropboss|002a|s|s|*
Pnyn|40|l|l|dropboss|003a|s|s|*
Saursus|40|l|l|dropboss|004a|s|s|*
Aulla|40|l|l|dropboss|005a|s|s|*
Taulo|40|l|l|dropboss|006a|s|s|*
Aullamu|40|l|l|dropboss|007a|s|s|*
Layla|40|l|l|dropboss|008a|s|s|*
Lawa|40|l|l|dropboss|009a|s|s|*
Demiros|40|l|l|dropboss|010a|s|s|*
Ansas|40|l|l|dropboss|011a|s|s|*
Moshav|40|l|l|dropboss|012a|s|s|*
K'nash|40|l|l|dropboss|013a|s|s|*
Setram|40|l|l|dropboss|014a|s|s|*
Kasia|40|l|l|dropboss|015a|s|s|*
Garsan|40|d|l|dropboss|002a|s|s|*
Trid|40|d|l|dropboss|003a|s|s|*
Kelpina|40|d|l|dropboss|004a|s|s|*
Nutah|40|d|l|dropboss|005a|s|s|*
Resana|40|d|l|dropboss|006a|s|s|*
Linx|40|d|l|dropboss|007a|s|s|*
Newbold|40|d|l|dropboss|008a|s|s|*
Axios|40|d|l|dropboss|009a|s|s|*
Hardirun|40|d|l|dropboss|010a|s|s|*
Barthien|40|d|l|dropboss|011a|s|s|*
Guruta|40|d|l|dropboss|012a|s|s|*
Shujakan|40|d|l|dropboss|013a|s|s|*
Karuka|40|d|l|dropboss|014a|s|s|*
Vishwada|40|d|l|dropboss|015a|s|s|*
Shylak|40|d|l|dropboss|016a|s|s|*
# items: code|name|itemLevel|trade
wp_sword_a_e_dropraid_001a_s|Ludra's Scale Sword|102|n
wp_sword_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Longsword|102|s
wp_sword_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Longsword|102|s
wp_sword_l_u_craftdraconic_003a_s|Wise Dragon Lord Longsword|94|s
wp_sword_d_u_craftdraconic_003a_s|Ebony Dragon Lord Longsword|94|s
wp_sword_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Longsword|86|s
wp_sword_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Longsword|86|s
wp_sword_a_u_dropparty1_005a_s|Enraged Kromede Sword|86|n
wp_sword_a_u_dropraid_001a_s|Abyssal Longsword|86|n
wp_sword_l_u_craftdraconic_002a_s|White Dragon Lord Longsword|78|s
wp_sword_d_u_craftdraconic_002a_s|Dark Dragon Lord Longsword|78|s
wp_sword_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Longsword|70|s
wp_sword_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Longsword|70|s
wp_sword_a_u_dropparty1_004a_s|Aulamus Longsword|70|n
wp_sword_l_u_craftdraconic_001a_s|True Dragon Lord Longsword|62|s
wp_sword_d_u_craftdraconic_001a_s|Star Dragon Lord Longsword|62|s
wp_sword_a_u_dropparty1_003a_s|Rupture Sword|54|n
wp_sword_a_u_dropabyss_005a_s|Deadly Instrument|51|s
wp_sword_a_u_dropabyss_004a_s|Fallen Ancient God Longsword|46|s
wp_sword_a_l_dropparty1_007a_s|Corrupted Judicator Longsword|45|n
wp_sword_a_l_dropparty1_013a_s|Black Claw Longsword|45|n
wp_sword_a_l_dropraid_001a_s|Lunatic Longsword|45|n
wp_sword_l_u_quest_001a_b|Spiritforged Longsword|45|n
wp_sword_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Longsword|44|s
wp_sword_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Longsword|44|s
wp_sword_a_l_dropabyss_005a_s|Pact-Bound Longsword|43|s
wp_sword_a_u_dropparty1_001a_s|Kromede Sword|43|n
wp_sword_a_l_dropparty1_006a_s|Divine Canyon Longsword|42|n
wp_sword_a_l_dropparty1_012a_s|Unyielding Longsword|42|n
wp_sword_l_u_drop_003a_s|Holy Spirit Longsword|41|s
wp_sword_d_u_drop_003a_s|Spectral Longsword|41|s
wp_sword_a_u_dropabyss_003a_s|Courage Longsword|41|s
wp_sword_a_l_dropparty1_004a_s|Anguish Longsword|40|n
wp_sword_a_l_dropparty1_005a_s|Division Longsword|40|n
wp_bow_a_e_dropraid_001a_s|Ludra's Fatal Bow|102|n
wp_bow_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Bow|102|s
wp_bow_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Bow|102|s
wp_bow_l_u_craftdraconic_003a_s|Wise Dragon Lord Bow|94|s
wp_bow_d_u_craftdraconic_003a_s|Ebony Dragon Lord Bow|94|s
wp_bow_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Bow|86|s
wp_bow_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Bow|86|s
wp_bow_a_u_dropparty1_005a_s|Enraged Kromede Longbow|86|n
wp_bow_a_u_dropraid_001a_s|Abyssal Bow|86|n
wp_bow_l_u_craftdraconic_002a_s|White Dragon Lord Bow|78|s
wp_bow_d_u_craftdraconic_002a_s|Dark Dragon Lord Bow|78|s
wp_bow_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Bow|70|s
wp_bow_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Bow|70|s
wp_bow_a_u_dropparty1_004a_s|Aulamus Bow|70|n
wp_bow_l_u_craftdraconic_001a_s|True Dragon Lord Bow|62|s
wp_bow_d_u_craftdraconic_001a_s|Star Dragon Lord Bow|62|s
wp_bow_a_u_dropparty1_003a_s|Rupture Longbow|54|n
wp_bow_a_u_dropabyss_005a_s|Sky Messenger|51|s
wp_bow_a_u_dropabyss_004a_s|Fallen Ancient God Bow|46|s
wp_bow_a_l_dropparty1_007a_s|Corrupted Judicator Bow|45|n
wp_bow_a_l_dropparty1_013a_s|Black Claw Bow|45|n
wp_bow_a_l_dropraid_001a_s|Lunatic Bow|45|n
wp_bow_l_u_quest_001a_b|Spiritforged Bow|45|n
wp_bow_l_u_craftcombo_001a_s|Artisan's Splendent Yggdrasil Bow|44|s
wp_bow_d_u_craftcombo_001a_s|Artisan's Splendent Asvata Bow|44|s
wp_bow_a_l_dropabyss_005a_s|Pact-Bound Bow|43|s
wp_bow_a_u_dropparty1_001a_s|Kromede Longbow|43|n
wp_bow_a_l_dropparty1_006a_s|Divine Canyon Bow|42|n
wp_bow_a_l_dropparty1_012a_s|Unyielding Bow|42|n
wp_bow_l_u_drop_003a_s|Holy Spirit Bow|41|s
wp_bow_d_u_drop_003a_s|Spectral Bow|41|s
wp_bow_a_u_dropabyss_003a_s|Courage Bow|41|s
wp_bow_a_l_dropparty1_004a_s|Anguish Bow|40|n
wp_bow_a_l_dropparty1_005a_s|Division Bow|40|n
wp_dagger_a_e_dropraid_001a_s|Ludra's Claw|102|n
wp_dagger_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Dagger|102|s
wp_dagger_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Dagger|102|s
wp_dagger_l_u_craftdraconic_003a_s|Wise Dragon Lord Dagger|94|s
wp_dagger_d_u_craftdraconic_003a_s|Ebony Dragon Lord Dagger|94|s
wp_dagger_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Dagger|86|s
wp_dagger_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Dagger|86|s
wp_dagger_a_u_dropparty1_005a_s|Enraged Kromede Silver Dagger|86|n
wp_dagger_a_u_dropraid_001a_s|Abyssal Dagger|86|n
wp_dagger_l_u_craftdraconic_002a_s|White Dragon Lord Dagger|78|s
wp_dagger_d_u_craftdraconic_002a_s|Dark Dragon Lord Dagger|78|s
wp_dagger_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Dagger|70|s
wp_dagger_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Dagger|70|s
wp_dagger_a_u_dropparty1_004a_s|Aulamus Dagger|70|n
wp_dagger_l_u_craftdraconic_001a_s|True Dragon Lord Dagger|62|s
wp_dagger_d_u_craftdraconic_001a_s|Star Dragon Lord Dagger|62|s
wp_dagger_a_u_dropparty1_003a_s|Rupture Knife|54|n
wp_dagger_a_u_dropabyss_005a_s|Resentful Pain|51|s
wp_dagger_a_u_dropabyss_004a_s|Fallen Ancient God Dagger|46|s
wp_dagger_a_l_dropparty1_007a_s|Corrupted Judicator Dagger|45|n
wp_dagger_a_l_dropparty1_013a_s|Black Claw Dagger|45|n
wp_dagger_a_l_dropraid_001a_s|Lunatic Dagger|45|n
wp_dagger_l_u_quest_001a_b|Spiritforged Dagger|45|n
wp_dagger_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Dagger|44|s
wp_dagger_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Dagger|44|s
wp_dagger_a_l_dropabyss_005a_s|Pact-Bound Dagger|43|s
wp_dagger_a_u_dropparty1_001a_s|Kromede Silver Dagger|43|n
wp_dagger_a_l_dropparty1_006a_s|Divine Canyon Dagger|42|n
wp_dagger_a_l_dropparty1_012a_s|Unyielding Dagger|42|n
wp_dagger_l_u_drop_003a_s|Holy Spirit Knife|41|s
wp_dagger_d_u_drop_003a_s|Spectral Knife|41|s
wp_dagger_a_u_dropabyss_003a_s|Courage Dagger|41|s
wp_dagger_a_l_dropparty1_004a_s|Anguish Dagger|40|n
wp_dagger_a_l_dropparty1_005a_s|Division Dagger|40|n
wp_greatsword_a_e_dropraid_001a_s|Ludra's Blade of Extinction|102|n
wp_greatsword_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Greatsword|102|s
wp_greatsword_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Greatsword|102|s
wp_greatsword_l_u_craftdraconic_003a_s|Wise Dragon Lord Greatsword|94|s
wp_greatsword_d_u_craftdraconic_003a_s|Ebony Dragon Lord Greatsword|94|s
wp_greatsword_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Greatsword|86|s
wp_greatsword_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Greatsword|86|s
wp_greatsword_a_u_dropparty1_005a_s|Enraged Kromede Claymore|86|n
wp_greatsword_a_u_dropraid_001a_s|Abyssal Claymore|86|n
wp_greatsword_l_u_craftdraconic_002a_s|White Dragon Lord Greatsword|78|s
wp_greatsword_d_u_craftdraconic_002a_s|Dark Dragon Lord Greatsword|78|s
wp_greatsword_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Greatsword|70|s
wp_greatsword_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Greatsword|70|s
wp_greatsword_a_u_dropparty1_004a_s|Aulamus Greatsword|70|n
wp_greatsword_l_u_craftdraconic_001a_s|True Dragon Lord Greatsword|62|s
wp_greatsword_d_u_craftdraconic_001a_s|Star Dragon Lord Greatsword|62|s
wp_greatsword_a_u_dropparty1_003a_s|Rupture Claymore|54|n
wp_greatsword_a_u_dropabyss_005a_s|Earthly Authority|51|s
wp_greatsword_a_u_dropabyss_004a_s|Fallen Ancient God Greatsword|46|s
wp_greatsword_a_l_dropparty1_007a_s|Corrupted Judicator Greatsword|45|n
wp_greatsword_a_l_dropparty1_013a_s|Black Claw Greatsword|45|n
wp_greatsword_a_l_dropraid_001a_s|Lunatic Greatsword|45|n
wp_greatsword_l_u_quest_001a_b|Spiritforged Greatsword|45|n
wp_greatsword_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Greatsword|44|s
wp_greatsword_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Greatsword|44|s
wp_greatsword_a_l_dropabyss_005a_s|Pact-Bound Greatsword|43|s
wp_greatsword_a_u_dropparty1_001a_s|Kromede Claymore|43|n
wp_greatsword_a_l_dropparty1_006a_s|Divine Canyon Greatsword|42|n
wp_greatsword_a_l_dropparty1_012a_s|Unyielding Greatsword|42|n
wp_greatsword_l_u_drop_003a_s|Holy Spirit Greatsword|41|s
wp_greatsword_d_u_drop_003a_s|Spectral Greatsword|41|s
wp_greatsword_a_u_dropabyss_003a_s|Courage Greatsword|41|s
wp_greatsword_a_l_dropparty1_004a_s|Anguish Greatsword|40|n
wp_greatsword_a_l_dropparty1_005a_s|Division Greatsword|40|n
wp_guarder_a_e_dropraid_001a_s|Ludra's Heart|102|n
wp_guarder_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Guard|102|s
wp_guarder_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Guard|102|s
wp_guarder_l_u_craftdraconic_003a_s|Wise Dragon Lord Guard|94|s
wp_guarder_d_u_craftdraconic_003a_s|Ebony Dragon Lord Guard|94|s
wp_guarder_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Guard|86|s
wp_guarder_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Guard|86|s
wp_guarder_a_u_dropparty1_011a_s|Nuakum Guard|86|n
wp_guarder_a_u_dropraid_001a_s|Abyssal Guard|86|n
wp_guarder_l_u_craftdraconic_002a_s|White Dragon Lord Guard|78|s
wp_guarder_d_u_craftdraconic_002a_s|Dark Dragon Lord Guard|78|s
wp_guarder_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Guard|70|s
wp_guarder_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Guard|70|s
wp_guarder_a_u_dropparty1_010a_s|Vakron Guard|70|n
wp_guarder_l_u_craftdraconic_001a_s|True Dragon Lord Guard|62|s
wp_guarder_d_u_craftdraconic_001a_s|Star Dragon Lord Guard|62|s
wp_guarder_a_u_dropparty1_002a_s|Bakarma Guard|54|n
wp_guarder_a_u_dropabyss_005a_s|Unyielding Spirit|51|s
wp_guarder_a_u_dropabyss_004a_s|Fallen Ancient God Guard|46|s
wp_guarder_l_u_quest_001a_b|Spiritforged Guard|45|n
wp_guarder_a_l_dropparty1_007a_s|Ignus Guard|45|n
wp_guarder_a_l_dropparty1_013a_s|Black Claw Guard|45|n
wp_guarder_a_l_dropraid_001a_s|Lunatic Guard|45|n
wp_guarder_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Guard|44|s
wp_guarder_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Guard|44|s
wp_guarder_a_l_dropabyss_005a_s|Pact-Bound Guard|43|s
wp_guarder_a_u_dropparty1_001a_s|Transcendent Guard|43|n
wp_guarder_a_l_dropparty1_006a_s|Turbulence Guard|42|n
wp_guarder_a_l_dropparty1_012a_s|Unyielding Guard|42|n
wp_guarder_l_u_drop_003a_s|Holy Spirit Guard|41|s
wp_guarder_d_u_drop_003a_s|Spectral Guard|41|s
wp_guarder_a_u_dropabyss_003a_s|Courage Guard|41|s
wp_guarder_a_l_dropparty1_004a_s|Anguish Guard|40|n
wp_guarder_a_l_dropparty1_005a_s|Sealed Will|40|n
wp_mace_a_e_dropraid_001a_s|Ludra's Fatal Mace|102|n
wp_mace_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Mace|102|s
wp_mace_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Mace|102|s
wp_mace_l_u_craftdraconic_003a_s|Wise Dragon Lord Mace|94|s
wp_mace_d_u_craftdraconic_003a_s|Ebony Dragon Lord Mace|94|s
wp_mace_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Mace|86|s
wp_mace_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Mace|86|s
wp_mace_a_u_dropparty1_005a_s|Enraged Kromede Warhammer|86|n
wp_mace_a_u_dropraid_001a_s|Abyssal Mace|86|n
wp_mace_l_u_craftdraconic_002a_s|White Dragon Lord Mace|78|s
wp_mace_d_u_craftdraconic_002a_s|Dark Dragon Lord Mace|78|s
wp_mace_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Mace|70|s
wp_mace_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Mace|70|s
wp_mace_a_u_dropparty1_004a_s|Aulamus Mace|70|n
wp_mace_l_u_craftdraconic_001a_s|True Dragon Lord Mace|62|s
wp_mace_d_u_craftdraconic_001a_s|Star Dragon Lord Mace|62|s
wp_mace_a_u_dropparty1_003a_s|Rupture Warhammer|54|n
wp_mace_a_u_dropabyss_005a_s|Infinite Potential|51|s
wp_mace_a_u_dropabyss_004a_s|Fallen Ancient God Mace|46|s
wp_mace_a_l_dropparty1_007a_s|Corrupted Judicator Mace|45|n
wp_mace_a_l_dropparty1_013a_s|Black Claw Mace|45|n
wp_mace_a_l_dropraid_001a_s|Lunatic Mace|45|n
wp_mace_l_u_quest_001a_b|Spiritforged Mace|45|n
wp_mace_l_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Mace|44|s
wp_mace_d_u_craftcombo_001a_s|Artisan's Splendent Orichalcum Mace|44|s
wp_mace_a_l_dropabyss_005a_s|Pact-Bound Mace|43|s
wp_mace_a_u_dropparty1_001a_s|Kromede Warhammer|43|n
wp_mace_a_l_dropparty1_006a_s|Divine Canyon Mace|42|n
wp_mace_a_l_dropparty1_012a_s|Unyielding Mace|42|n
wp_mace_l_u_drop_003a_s|Holy Spirit Mace|41|s
wp_mace_d_u_drop_003a_s|Spectral Mace|41|s
wp_mace_a_u_dropabyss_003a_s|Courage Mace|41|s
wp_mace_a_l_dropparty1_004a_s|Anguish Mace|40|n
wp_mace_a_l_dropparty1_005a_s|Division Mace|40|n
wp_magicbook_a_e_dropraid_001a_s|Ludra's Grimoire|102|n
wp_magicbook_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Spellbook|102|s
wp_magicbook_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Spellbook|102|s
wp_magicbook_l_u_craftdraconic_003a_s|Wise Dragon Lord Spellbook|94|s
wp_magicbook_d_u_craftdraconic_003a_s|Ebony Dragon Lord Spellbook|94|s
wp_magicbook_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Spellbook|86|s
wp_magicbook_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Spellbook|86|s
wp_magicbook_a_u_dropparty1_005a_s|Enraged Kromede Spellbook|86|n
wp_magicbook_a_u_dropraid_001a_s|Abyssal Spellbook|86|n
wp_magicbook_l_u_craftdraconic_002a_s|White Dragon Lord Spellbook|78|s
wp_magicbook_d_u_craftdraconic_002a_s|Dark Dragon Lord Spellbook|78|s
wp_magicbook_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Spellbook|70|s
wp_magicbook_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Spellbook|70|s
wp_magicbook_a_u_dropparty1_004a_s|Aulamus Spellbook|70|n
wp_magicbook_l_u_craftdraconic_001a_s|True Dragon Lord Spellbook|62|s
wp_magicbook_d_u_craftdraconic_001a_s|Star Dragon Lord Spellbook|62|s
wp_magicbook_a_u_dropparty1_003a_s|Rupture Tome|54|n
wp_magicbook_a_u_dropabyss_005a_s|Forbidden Truth|51|s
wp_magicbook_a_u_dropabyss_004a_s|Fallen Ancient God Spellbook|46|s
wp_magicbook_a_l_dropparty1_007a_s|Corrupted Judicator Spellbook|45|n
wp_magicbook_a_l_dropparty1_013a_s|Black Claw Spellbook|45|n
wp_magicbook_a_l_dropraid_001a_s|Lunatic Spellbook|45|n
wp_magicbook_l_u_quest_001a_b|Spiritforged Spellbook|45|n
wp_magicbook_l_u_craftcombo_001a_s|Artisan's Splendent Truth Spellbook|44|s
wp_magicbook_d_u_craftcombo_001a_s|Artisan's Splendent Truth Spellbook|44|s
wp_magicbook_a_l_dropabyss_005a_s|Pact-Bound Spellbook|43|s
wp_magicbook_a_u_dropparty1_001a_s|Kromede Spellbook|43|n
wp_magicbook_a_l_dropparty1_006a_s|Divine Canyon Spellbook|42|n
wp_magicbook_a_l_dropparty1_012a_s|Unyielding Spellbook|42|n
wp_magicbook_l_u_drop_003a_s|Holy Spirit Spellbook|41|s
wp_magicbook_d_u_drop_003a_s|Spectral Spellbook|41|s
wp_magicbook_a_u_dropabyss_003a_s|Courage Spellbook|41|s
wp_magicbook_a_l_dropparty1_004a_s|Anguish Spellbook|40|n
wp_magicbook_a_l_dropparty1_005a_s|Division Spellbook|40|n
wp_orb_a_e_dropraid_001a_s|Ludra's Abyssal Jade|102|n
wp_orb_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Orb|102|s
wp_orb_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Orb|102|s
wp_orb_l_u_craftdraconic_003a_s|Wise Dragon Lord Orb|94|s
wp_orb_d_u_craftdraconic_003a_s|Ebony Dragon Lord Orb|94|s
wp_orb_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Orb|86|s
wp_orb_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Orb|86|s
wp_orb_a_u_dropparty1_005a_s|Enraged Kromede Jewel|86|n
wp_orb_a_u_dropraid_001a_s|Abyssal Orb|86|n
wp_orb_l_u_craftdraconic_002a_s|White Dragon Lord Orb|78|s
wp_orb_d_u_craftdraconic_002a_s|Dark Dragon Lord Orb|78|s
wp_orb_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Orb|70|s
wp_orb_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Orb|70|s
wp_orb_a_u_dropparty1_004a_s|Aulamus Orb|70|n
wp_orb_l_u_craftdraconic_001a_s|True Dragon Lord Orb|62|s
wp_orb_d_u_craftdraconic_001a_s|Star Dragon Lord Orb|62|s
wp_orb_a_u_dropparty1_003a_s|Rupture Jewel|54|n
wp_orb_a_u_dropabyss_005a_s|Labyrinth's Heart|51|s
wp_orb_a_u_dropabyss_004a_s|Fallen Ancient God Orb|46|s
wp_orb_a_l_dropparty1_007a_s|Corrupted Judicator Orb|45|n
wp_orb_a_l_dropparty1_013a_s|Black Claw Orb|45|n
wp_orb_a_l_dropraid_001a_s|Lunatic Orb|45|n
wp_orb_l_u_quest_001a_b|Spiritforged Orb|45|n
wp_orb_l_u_craftcombo_001a_s|Artisan's Splendent Truth Orb|44|s
wp_orb_d_u_craftcombo_001a_s|Artisan's Splendent Truth Orb|44|s
wp_orb_a_l_dropabyss_005a_s|Pact-Bound Orb|43|s
wp_orb_a_u_dropparty1_001a_s|Kromede Jewel|43|n
wp_orb_a_l_dropparty1_006a_s|Divine Canyon Orb|42|n
wp_orb_a_l_dropparty1_012a_s|Unyielding Orb|42|n
wp_orb_l_u_drop_003a_s|Holy Spirit Orb|41|s
wp_orb_d_u_drop_003a_s|Spectral Orb|41|s
wp_orb_a_u_dropabyss_003a_s|Courage Orb|41|s
wp_orb_a_l_dropparty1_004a_s|Anguish Orb|40|n
wp_orb_a_l_dropparty1_005a_s|Division Orb|40|n
wp_staff_a_e_dropraid_001a_s|Ludra's Heavenbound Staff|102|n
wp_staff_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Staff|102|s
wp_staff_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Staff|102|s
wp_staff_l_u_craftdraconic_003a_s|Wise Dragon Lord Staff|94|s
wp_staff_d_u_craftdraconic_003a_s|Ebony Dragon Lord Staff|94|s
wp_staff_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Staff|86|s
wp_staff_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Staff|86|s
wp_staff_a_u_dropparty1_005a_s|Enraged Kromede Rod|86|n
wp_staff_a_u_dropraid_001a_s|Abyssal Staff|86|n
wp_staff_l_u_craftdraconic_002a_s|White Dragon Lord Staff|78|s
wp_staff_d_u_craftdraconic_002a_s|Dark Dragon Lord Staff|78|s
wp_staff_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Staff|70|s
wp_staff_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Staff|70|s
wp_staff_a_u_dropparty1_004a_s|Aulamus Staff|70|n
wp_staff_l_u_craftdraconic_001a_s|True Dragon Lord Staff|62|s
wp_staff_d_u_craftdraconic_001a_s|Star Dragon Lord Staff|62|s
wp_staff_a_u_dropparty1_003a_s|Rupture Rod|54|n
wp_staff_a_u_dropabyss_005a_s|Overwhelming Support|51|s
wp_staff_a_u_dropabyss_004a_s|Fallen Ancient God Staff|46|s
wp_staff_a_l_dropparty1_007a_s|Corrupted Judicator Staff|45|n
wp_staff_a_l_dropparty1_013a_s|Black Claw Staff|45|n
wp_staff_a_l_dropraid_001a_s|Lunatic Staff|45|n
wp_staff_l_u_quest_001a_b|Spiritforged Staff|45|n
wp_staff_l_u_craftcombo_001a_s|Artisan's Splendent Yggdrasil Staff|44|s
wp_staff_d_u_craftcombo_001a_s|Artisan's Splendent Asvata Staff|44|s
wp_staff_a_l_dropabyss_005a_s|Pact-Bound Staff|43|s
wp_staff_a_u_dropparty1_001a_s|Kromede Rod|43|n
wp_staff_a_l_dropparty1_006a_s|Divine Canyon Staff|42|n
wp_staff_a_l_dropparty1_012a_s|Unyielding Staff|42|n
wp_staff_l_u_drop_003a_s|Holy Spirit Staff|41|s
wp_staff_d_u_drop_003a_s|Spectral Staff|41|s
wp_staff_a_u_dropabyss_003a_s|Courage Staff|41|s
wp_staff_a_l_dropparty1_004a_s|Anguish Staff|40|n
wp_staff_a_l_dropparty1_005a_s|Division Staff|40|n
acc_earring_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Earrings|102|s
acc_earring_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Earrings|102|s
acc_earring_l_u_craftdraconic_003a_s|Wise Dragon Lord Earrings|94|s
acc_earring_d_u_craftdraconic_003a_s|Ebony Dragon Lord Earrings|94|s
acc_earring_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Earrings|86|s
acc_earring_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Earrings|86|s
acc_earring_a_u_dropparty1_005a_s|Enraged Kromede Earrings|86|n
acc_earring_a_u_dropboss_001a_s|Guardian Lord Nahma Earrings|86|s
acc_earring_a_u_dropraid_001a_s|Abyssal Earrings|86|n
acc_earring_l_u_craftdraconic_002a_s|White Dragon Lord Earrings|78|s
acc_earring_d_u_craftdraconic_002a_s|Dark Dragon Lord Earrings|78|s
acc_earring_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Earrings|70|s
acc_earring_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Earrings|70|s
acc_earring_a_u_dropparty1_004a_s|Aulamus Earrings|70|n
acc_earring_a_u_dropboss_008a_s|Gartua Earrings|70|s
acc_earring_a_u_dropboss_010a_s|Argo Earrings|70|s
acc_earring_l_u_craftdraconic_001a_s|True Dragon Lord Earrings|62|s
acc_earring_d_u_craftdraconic_001a_s|Star Dragon Lord Earrings|62|s
acc_earring_a_u_dropboss_009a_s|Kaira Earrings|56|s
acc_earring_a_u_dropparty1_003a_s|Berk Earrings|54|n
acc_earring_a_u_dropabyss_005a_s|Conquering Diamond Earrings|51|s
acc_earring_a_u_dropabyss_004a_s|Fallen Ancient God Diamond Earrings|46|s
acc_earring_a_u_dropboss_006a_s|Dartan Earrings|46|s
acc_earring_a_u_dropboss_011a_s|Kashapa Earrings|46|s
acc_earring_a_u_dropboss_012a_s|High Commander Lagta Earrings|46|s
acc_earring_a_l_dropparty1_007a_s|Murute Earrings|45|n
acc_earring_a_l_dropparty1_013a_s|Black Claw Earrings|45|n
acc_earring_l_u_craftcombo_001a_s|Artisan's Splendent Diamond Earrings|44|s
acc_earring_d_u_craftcombo_001a_s|Artisan's Splendent Diamond Earrings|44|s
acc_earring_a_l_dropabyss_005a_s|Pact-Bound Diamond Earrings|43|s
acc_earring_l_l_quest_002a_b|Pilgrim Earrings|43|n
acc_earring_d_l_quest_002a_b|Liberator Earrings|43|n
acc_earring_a_l_dropparty1_006a_s|Divine Canyon Earrings|42|n
acc_earring_a_l_dropparty1_012a_s|Unyielding Earrings|42|n
acc_earring_a_u_dropabyss_003a_s|Courage Diamond Earrings|41|s
acc_earring_a_l_dropparty1_004a_s|Saraswati Earrings|40|n
acc_earring_a_l_dropparty1_005a_s|Division Earrings|40|n
acc_ring_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Ring|102|s
acc_ring_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Ring|102|s
acc_ring_l_u_craftdraconic_003a_s|Wise Dragon Lord Ring|94|s
acc_ring_d_u_craftdraconic_003a_s|Ebony Dragon Lord Ring|94|s
acc_ring_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Ring|86|s
acc_ring_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Ring|86|s
acc_ring_a_u_dropparty1_005a_s|Enraged Kromede Ring|86|n
acc_ring_a_u_dropboss_001a_s|Guardian Lord Nahma Ring|86|s
acc_ring_a_u_dropraid_001a_s|Abyssal Ring|86|n
acc_ring_l_u_craftdraconic_002a_s|White Dragon Lord Ring|78|s
acc_ring_d_u_craftdraconic_002a_s|Dark Dragon Lord Ring|78|s
acc_ring_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Ring|70|s
acc_ring_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Ring|70|s
acc_ring_a_u_dropparty1_004a_s|Aulamus Ring|70|n
acc_ring_a_u_dropboss_008a_s|Gartua Ring|70|s
acc_ring_a_u_dropboss_010a_s|Argo Ring|70|s
acc_ring_l_u_craftdraconic_001a_s|True Dragon Lord Ring|62|s
acc_ring_d_u_craftdraconic_001a_s|Star Dragon Lord Ring|62|s
acc_ring_a_u_dropboss_009a_s|Kaira Ring|56|s
acc_ring_a_u_dropparty1_003a_s|Berk Ring|54|n
acc_ring_a_u_dropabyss_005a_s|Conquering Sapphire Ring|51|s
acc_ring_a_u_dropabyss_004a_s|Fallen Ancient God Sapphire Ring|46|s
acc_ring_a_u_dropboss_006a_s|Dartan Ring|46|s
acc_ring_a_u_dropboss_011a_s|Kashapa Ring|46|s
acc_ring_a_u_dropboss_012a_s|High Commander Lagta Ring|46|s
acc_ring_a_l_dropparty1_007a_s|Rotan Loop|45|n
acc_ring_a_l_dropparty1_013a_s|Black Claw Ring|45|n
acc_ring_l_u_craftcombo_001a_s|Artisan's Splendent Sapphire Ring|44|s
acc_ring_d_u_craftcombo_001a_s|Artisan's Splendent Sapphire Ring|44|s
acc_ring_a_l_dropabyss_005a_s|Pact-Bound Sapphire Ring|43|s
acc_ring_l_l_quest_002a_b|Pilgrim Ring|43|n
acc_ring_d_l_quest_002a_b|Liberator Ring|43|n
acc_ring_a_l_dropparty1_006a_s|Divine Canyon Ring|42|n
acc_ring_a_l_dropparty1_012a_s|Wind Forest Ring|42|n
acc_ring_a_u_dropabyss_003a_s|Courage Sapphire Ring|41|s
acc_ring_a_l_dropparty1_004a_s|Anguish Ring|40|n
acc_ring_a_l_dropparty1_005a_s|Division Ring|40|n
acc_necklace_l_u_craftdraconiccombo_003a_s|Splendent Wise Dragon Lord Necklace|102|s
acc_necklace_d_u_craftdraconiccombo_003a_s|Splendent Ebony Dragon Lord Necklace|102|s
acc_necklace_l_u_craftdraconic_003a_s|Wise Dragon Lord Necklace|94|s
acc_necklace_d_u_craftdraconic_003a_s|Ebony Dragon Lord Necklace|94|s
acc_necklace_l_u_craftdraconiccombo_002a_s|Splendent White Dragon Lord Necklace|86|s
acc_necklace_d_u_craftdraconiccombo_002a_s|Splendent Dark Dragon Lord Necklace|86|s
acc_necklace_a_u_dropparty1_005a_s|Enraged Kromede Necklace|86|n
acc_necklace_a_u_dropboss_001a_s|Guardian Lord Nahma Necklace|86|s
acc_necklace_a_u_dropraid_001a_s|Abyssal Necklace|86|n
acc_necklace_l_u_craftdraconic_002a_s|White Dragon Lord Necklace|78|s
acc_necklace_d_u_craftdraconic_002a_s|Dark Dragon Lord Necklace|78|s
acc_necklace_l_u_craftdraconiccombo_001a_s|Splendent True Dragon Lord Necklace|70|s
acc_necklace_d_u_craftdraconiccombo_001a_s|Splendent Star Dragon Lord Necklace|70|s
acc_necklace_a_u_dropparty1_004a_s|Aulamus Necklace|70|n
acc_necklace_a_u_dropboss_006a_s|Gartua Necklace|70|s
acc_necklace_a_u_dropboss_008a_s|Argo Necklace|70|s
acc_necklace_l_u_craftdraconic_001a_s|True Dragon Lord Necklace|62|s
acc_necklace_d_u_craftdraconic_001a_s|Star Dragon Lord Necklace|62|s
acc_necklace_a_u_dropboss_007a_s|Kaira Necklace|56|s
acc_necklace_a_u_dropparty1_003a_s|Berk Necklace|54|n
acc_necklace_a_u_dropabyss_005a_s|Conquering Ruby Necklace|51|s
acc_necklace_a_u_dropabyss_004a_s|Fallen Ancient God Ruby Necklace|46|s
acc_necklace_a_u_dropboss_004a_s|Dartan Necklace|46|s
acc_necklace_a_u_dropboss_009a_s|Kashapa Necklace|46|s
acc_necklace_a_u_dropboss_010a_s|High Commander Lagta Necklace|46|s
acc_necklace_a_l_dropparty1_007a_s|Corrupted Judicator Necklace|45|n
acc_necklace_a_l_dropparty1_013a_s|Fera Necklace|45|n
acc_necklace_l_u_craftcombo_001a_s|Artisan's Splendent Ruby Necklace|44|s
acc_necklace_d_u_craftcombo_001a_s|Artisan's Splendent Ruby Necklace|44|s
acc_necklace_a_l_dropabyss_005a_s|Pact-Bound Ruby Necklace|43|s
acc_necklace_l_l_quest_002a_b|Pilgrim Necklace|43|n
acc_necklace_d_l_quest_002a_b|Liberator Necklace|43|n
acc_necklace_a_l_dropparty1_006a_s|Divine Canyon Necklace|42|n
acc_necklace_a_l_dropparty1_012a_s|Unyielding Necklace|42|n
acc_necklace_a_u_dropabyss_003a_s|Courage Ruby Necklace|41|s
acc_necklace_a_l_dropparty1_004a_s|Lakshmi Necklace|40|n
acc_necklace_a_l_dropparty1_005a_s|Division Necklace|40|n
acc_bracelet_a_u_dropraid_001a_s|Abyssal Bracelet|86|n
acc_bracelet_l_u_quest_001a_b|Ascension Bracelet|51|n
acc_bracelet_l_l_quest_002a_b|Pilgrim Bracelet|43|n
acc_bracelet_d_l_quest_002a_b|Liberator Bracelet|43|n
etc_amulet_a_u_quest_001a_b|Revelation Amulet|65|n
etc_amulet_a_u_quest_002a_b|Fierce Battle Amulet|65|n
etc_belt_a_u_quest_001a_b|Noble Belt|65|n
etc_rune_a_s_shopcoin2_001a_b|Clash Rune|40|n`;
  root.BA_ITEMS_RAW = RAW;
  root.BA_ITEMS_META = { source: 'Metaroad', url: 'https://metaroad.gg/aion2/database/items', exported: '2026-10-18', minLevel: 40 };
  if (typeof module !== 'undefined' && module.exports) module.exports = { RAW: RAW, META: root.BA_ITEMS_META };
})(typeof window !== 'undefined' ? window : globalThis);
