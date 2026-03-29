#!/usr/bin/env node
// add-fame.js — stamps a fame:N field onto every bird entry in birds.js
// Run once: node add-fame.js

const fs = require('fs');
const path = require('path');

// fame 1=expert only, 2=keen birder, 3=nature fan, 4=most people, 5=universal
const FAME = {
  // Africa
  'Shoebill': 3, 'Secretary Bird': 3, 'Hammerkop': 2, 'Marabou Stork': 3,
  'African Fish Eagle': 3, 'Lilac-breasted Roller': 3, 'Southern Ground Hornbill': 2,
  'Hoopoe': 4, 'Cape Sugarbird': 2, 'Ostrich': 5, 'Saddle-billed Stork': 2,
  'African Skimmer': 1, "Pel's Fishing Owl": 2, "Hartlaub's Turaco": 1,
  'Superb Starling': 2, 'Kori Bustard': 2, 'Grey Crowned Crane': 3,
  'Rosy-faced Lovebird': 4, 'Black-and-white Casqued Hornbill': 1, 'African Pitta': 1,
  'Martial Eagle': 2, 'Bateleur': 2, 'Namaqua Sandgrouse': 1, 'Long-crested Eagle': 1,
  'Pennant-winged Nightjar': 1, 'Black Heron': 2, 'Greater Honeyguide': 2,
  'Long-tailed Widowbird': 2, 'African Broadbill': 1, 'African Finfoot': 1,
  'Sunbird Asity': 1, 'Lappet-faced Vulture': 2, 'Hooded Vulture': 2,
  "Verreaux's Eagle": 2, 'Taita Falcon': 1, 'White-fronted Bee-eater': 2,
  'African Jacana': 2, 'Knysna Turaco': 2, 'African Openbill': 1, 'Palm-nut Vulture': 1,
  // Asia
  'Indian Peafowl': 5, 'Himalayan Monal': 2, 'Red-crowned Crane': 3,
  'Oriental Pied Hornbill': 2, 'Sarus Crane': 2, 'Indian Roller': 2,
  'Painted Stork': 2, 'Indian Paradise Flycatcher': 2, 'Siberian Crane': 2,
  'Great Hornbill': 3, 'Brahminy Kite': 2, 'Sri Lanka Frogmouth': 1,
  'Stork-billed Kingfisher': 1, 'Blue Pitta': 1, "Jerdon's Courser": 1,
  'Malabar Trogon': 1, 'Spoon-billed Sandpiper': 2, 'Milky Stork': 1,
  'Bar-headed Goose': 2, 'Mandarin Duck': 4, "Walden's Hornbill": 1,
  'Bornean Bristlehead': 1, 'Wrinkled Hornbill': 1, "Gurney's Pitta": 1,
  'Philippine Eagle': 3, 'Palawan Peacock-Pheasant': 2, "Storm's Stork": 1,
  'Crested Serpent Eagle': 2, 'Cheer Pheasant': 1, 'Satyr Tragopan': 2,
  "Temminck's Tragopan": 1, 'Green Peafowl': 3, "Wilson's Bird-of-Paradise": 2,
  "Wallace's Standardwing": 1, 'Maleo': 1, 'Nicobar Pigeon': 2,
  'Black-naped Pheasant-Pigeon': 1, 'Halmahera Paradise Crow': 1,
  'Spot-billed Pelican': 1, 'Pied Kingfisher': 2,
  // Australia / NZ / Pacific
  'Cassowary': 4, 'Kea': 4, 'Kiwi': 5, 'Tawny Frogmouth': 3, 'Superb Lyrebird': 4,
  'Rifleman': 2, 'Laughing Kookaburra': 4, 'Kakapo': 4, 'Satin Bowerbird': 3,
  'Regent Bowerbird': 2, 'Tooth-billed Bowerbird': 1, 'Vogelkop Bowerbird': 2,
  'Raggiana Bird-of-Paradise': 3, 'King Bird-of-Paradise': 2, 'Western Parotia': 2,
  'King-of-Saxony Bird-of-Paradise': 1, 'Blue Bird-of-Paradise': 2,
  'Twelve-wired Bird-of-Paradise': 1, 'Magnificent Riflebird': 2,
  'Victoria Crowned Pigeon': 3, 'Palm Cockatoo': 3, 'Gang-gang Cockatoo': 2,
  'Glossy Black-Cockatoo': 1, 'Yellow-tailed Black-Cockatoo': 2, 'Swift Parrot': 2,
  'Orange-bellied Parrot': 2, "Pesquet's Parrot": 2, 'Eclectus Parrot': 3, 'Emu': 5,
  'Wedge-tailed Eagle': 3, 'Australian Brushturkey': 2, 'Malleefowl': 2,
  'Plains-wanderer': 1, 'Night Parrot': 2, 'Gouldian Finch': 3, 'Splendid Fairywren': 3,
  'Noisy Scrubbird': 1, 'Powerful Owl': 2, 'Apostlebird': 1, 'Chowchilla': 1,
  'Takahe': 3, 'Wrybill': 2, 'Black Stilt': 1, 'New Zealand Bellbird': 2, 'Hihi': 1,
  'Kokako': 2, 'Saddleback': 2, 'Kaka': 3, 'Weka': 2, 'New Zealand Dotterel': 1,
  'Logrunner': 1,
  // Europe
  'Bearded Vulture': 3, 'European Bee-eater': 3, 'Common Kingfisher': 4,
  'Atlantic Puffin': 5, 'Great Bustard': 3, 'White-tailed Eagle': 3,
  'Eurasian Bittern': 2, 'Dalmatian Pelican': 2, 'Eurasian Eagle Owl': 3,
  'Great Grey Shrike': 2, 'Wallcreeper': 2, 'Snow Bunting': 2, 'Eurasian Dotterel': 1,
  'Ruff': 2, 'Red Kite': 3, 'Eurasian Roller': 2, 'Wryneck': 2,
  'Eurasian Spoonbill': 2, 'Black Woodpecker': 2, 'Hawfinch': 2, 'Penduline Tit': 2,
  'White-winged Snowfinch': 1, 'Cinereous Vulture': 2, 'Common Firecrest': 2,
  'Bluethroat': 2, 'Pygmy Cormorant': 1, 'Eurasian Scops Owl': 2,
  "Tengmalm's Owl": 1, 'Great Snipe': 1, 'Eurasian Woodcock': 2,
  // North America
  'Arctic Tern': 3, 'Peregrine Falcon': 4, 'Snowy Owl': 5, 'Greater Roadrunner': 4,
  "Clark's Nutcracker": 2, 'Burrowing Owl': 3, 'Common Loon': 3, 'Osprey': 3,
  "Anna's Hummingbird": 3, 'Bobolink': 2, 'Red Knot': 2, 'Limpkin': 2,
  'Snail Kite': 1, 'American Dipper': 2, 'Harlequin Duck': 2, 'Painted Bunting': 3,
  'Scissor-tailed Flycatcher': 2, 'Long-billed Curlew': 2, 'Whooping Crane': 4,
  'California Condor': 4, 'Vermilion Flycatcher': 3, 'Phainopepla': 1, 'Elf Owl': 2,
  'Elegant Trogon': 2, 'Thick-billed Parrot': 2, 'Marbled Murrelet': 1,
  'Western Grebe': 2, 'Spruce Grouse': 2, 'Tufted Puffin': 3, 'Rhinoceros Auklet': 1,
  'Ivory Gull': 2, "Ross's Gull": 1, "Steller's Sea Eagle": 3,
  'Bristle-thighed Curlew': 1, "Kirtland's Warbler": 1, 'Prothonotary Warbler': 1,
  'Gunnison Sage-Grouse': 1, 'Roseate Spoonbill': 4, 'Bee Hummingbird': 3,
  // Central / South America
  'Resplendent Quetzal': 4, 'Turquoise-browed Motmot': 2, 'Keel-billed Toucan': 4,
  'Harpy Eagle': 4, 'Sunbittern': 2, 'Wire-tailed Manakin': 1, 'Club-winged Manakin': 1,
  'Amazonian Umbrellabird': 2, 'Spectacled Owl': 2, 'Sungrebe': 1, 'Agami Heron': 1,
  'Zigzag Heron': 1, 'Snowcap': 1, 'Royal Flycatcher': 2, 'Purple-crowned Fairy': 1,
  'Fiery-throated Hummingbird': 1, 'Great Curassow': 1, 'Lovely Cotinga': 1,
  'Snowy Cotinga': 1, 'Andean Condor': 4, 'Hoatzin': 3, 'Cock-of-the-rock': 3,
  'Horned Screamer': 2, 'Jabiru': 2, 'Inca Tern': 3, 'Emperor Penguin': 5,
  'Rockhopper Penguin': 3, 'Macaroni Penguin': 3, 'Magellanic Penguin': 3,
  'Torrent Duck': 2, 'Oilbird': 2, 'Capuchinbird': 1, 'Purple-breasted Cotinga': 1,
  'Banded Cotinga': 1, 'Long-wattled Umbrellabird': 2, 'Common Potoo': 2,
  'Great Potoo': 2, 'Pale-winged Trumpeter': 1, 'Giant Antpitta': 1,
  'Coppery-chested Jacamar': 1, 'Rufescent Tiger Heron': 1, 'Titicaca Grebe': 1,
  "James's Flamingo": 2, 'Puna Flamingo': 1, 'Hooded Grebe': 1, 'Giant Coot': 1,
  'Wattled Curassow': 1, 'Maguari Stork': 1, 'Toco Toucan': 4,
  // Seabirds
  'Wandering Albatross': 4, 'Waved Albatross': 2, 'Light-mantled Albatross': 1,
  'Southern Giant Petrel': 1, 'Snow Petrel': 2, 'Blue-footed Booby': 4,
  'Red-footed Booby': 2, 'Magnificent Frigatebird': 3, 'White Tern': 2,
  'South Polar Skua': 2, 'Long-tailed Jaeger': 1, 'Swallow-tailed Gull': 2,
  'Sooty Shearwater': 1, 'Manx Shearwater': 2, "Wilson's Storm Petrel": 1,
  'Red-billed Tropicbird': 2, 'White-tailed Tropicbird': 1, "Abbott's Booby": 1,
  'Masked Booby': 1, 'Brown Noddy': 1, 'Christmas Frigatebird': 1,
  // Owls / nightbirds
  'Great Grey Owl': 3, "Blakiston's Fish Owl": 2, "Verreaux's Eagle Owl": 2,
  'Crested Owl': 1, 'Long-eared Owl': 3, 'Barn Owl': 5, 'Papuan Frogmouth': 1,
  'Standard-winged Nightjar': 1, 'Lyre-tailed Nightjar': 1, 'Pharaoh Eagle Owl': 2,
  // Flamingos / Cranes / Waders
  'Greater Flamingo': 5, 'Lesser Flamingo': 3, 'Chilean Flamingo': 3,
  'Wattled Crane': 2, 'Black Crowned Crane': 3, 'Demoiselle Crane': 3,
  'Common Crane': 2, 'Sandhill Crane': 3, 'Black-necked Crane': 2,
  'Brolga': 2, 'Blue Crane': 2,
  // Any remaining birds default to fame 2
};

const DEFAULT_FAME = 2;

const file = path.join(__dirname, 'birds.js');
let src = fs.readFileSync(file, 'utf8');

let patched = 0;
let notFound = [];

// Replace each { name: "X", fact: with { name: "X", fame: N, fact:
src = src.replace(/\{ name: "([^"]+)", fact:/g, (match, name) => {
  const fame = FAME[name];
  if (fame === undefined) {
    notFound.push(name);
    return `{ name: "${name}", fame: ${DEFAULT_FAME}, fact:`;
  }
  patched++;
  return `{ name: "${name}", fame: ${fame}, fact:`;
});

fs.writeFileSync(file, src);
console.log(`Patched ${patched} birds with fame scores.`);
if (notFound.length) {
  console.log(`Used default fame ${DEFAULT_FAME} for ${notFound.length} unrecognised names:`);
  notFound.forEach(n => console.log('  -', n));
}
