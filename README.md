# ORBIT

*Per orbitas ad astra: through orbits to the stars.*

**[Play in your browser →](https://santillio.github.io/orbit/)**

A 2D space arcade game in a single self-contained HTML file, with endless runs,
an expedition campaign, persistent progress, and a discoverable space atlas.
The game's interface and catalog texts are in English.

A ball orbits a planet. Time your launch to send it along a tangent and catch
the next planet's orbit. After one full revolution, gravity shrinks the orbit
toward the planet. Launch before reaching the surface. A miss or a gravity
collision ends the attempt.

In Endless, a collected spare attempt can rescue one failed flight or gravity
collision without losing the run's score.

## Game modes

- **Expedition:** explore 13 galaxies with 77 systems each, for 1,001 distinct
  systems. Within each system, travel from an outer planet to the central star.
  The campaign starts at the Solar System, then Proxima Centauri, Barnard's Star,
  and Ross 128, followed by the selected known systems in approximate order of
  increasing distance from the Sun. There are 11 real systems and 990 explicitly
  fictional ones with stable names, planet rosters, descriptions, star colors, and
  gameplay parameters. This is a selected catalog, not an exhaustive list of all
  nearby stars. Completing a system unlocks the next one.
- **Endless:** an optional mode with procedural planets, increasing orbit speed,
  and a separate high score.

The galaxy is the main menu. Select the glowing current sector to begin or resume
the expedition. Completed sectors reveal descriptions, stars, and best scores on
hover or keyboard focus; tap them to inspect on a touchscreen. Their detail card
can restart the system. Drag empty space to pan, use the wheel or zoom buttons to
magnify, and use the center button to return to the current sector.
Each galaxy has one continuous three-turn spiral, running from its outer sector
to its core at sector 77. Completed portions of the route light up. Reaching the
core opens the next galaxy. The galaxy arrows let players inspect other chapters
without unlocking their systems. The Milky Way and Andromeda are real galaxies;
the other 11 galaxy settings are fictional. Every system outside the Milky Way is
fictional, including the playable sectors in Andromeda.

Endless has a secondary button at the bottom center and is currently available
without an unlock requirement. The full system list and atlas remain accessible
through compact navigation buttons.

The first expedition follows Neptune → Uranus → Saturn → Jupiter → Mars → Earth
→ Venus → Mercury → Sun. Losing restarts the system while preserving unlocked levels.

## Run locally

Download `index.html` and open it in a browser. No installation, build step,
or internet connection is required. Play with a keyboard, mouse, or touchscreen.

## Controls

| Action | Input |
| --- | --- |
| Begin expedition | Current glowing sector, or Space in the galaxy |
| Launch | Space, click, or tap during play |
| Pause / resume | P or Esc |
| Restart | R |
| Toggle sound | M or the speaker button |

The mint arc marks the launch window. Its ends are where the ball grazes the next
orbit, which is where tangential captures happen. The short dotted line ahead of the ball shows its flight direction.
Instructions appear only on the first visit to the first system. The briefing
freezes the ball and gravity until dismissed. Completing it is remembered, and
replaying or resuming later does not add persistent tutorial text to gameplay.

## Features

- Procedural planets and increasing difficulty. Solar System worlds have distinct
  surface and cloud textures, spherical lighting, and layered Saturn rings.
- Shrinking orbits after one complete actual revolution, including arrival easing.
  Gravity is communicated by the orbit itself, without a countdown or text warning.
- Interactive procedural galaxy maps with completed sectors, contextual
  descriptions, a glowing current sector, mouse/touch selection, pan, and zoom.
  Continuing zooms into the saved sector before resuming its exact orbit or flight.
- Each planet adds 10% of the starting angular speed to the orbit speed.
- Smooth camera movement and a continuous ball trail. Departed planets stay intact
  and leave the camera naturally; launching creates no debris or shockwave.
- Smooth orbit capture that carries arrival speed into the new orbit.
- Tangential capture bonuses, combos, and brief, eased slow motion.
- A high score saved in browser storage when available.
- Automatic saves for the current attempt, unlocked levels, mode records, settings,
  and discovered worlds. Gameplay stays frozen during the entry transition;
  switching windows pauses the transition safely.
- A space atlas with galaxy, system, and world cards. Expedition visits unlock
  world descriptions. The catalog contains 7,986 worlds including central stars.
  Maps and atlas views use bounded pages, with a level-number lookup and a shortcut
  to current progress. Fictional worlds never display scientific source links.
- Fictional systems include frozen, oceanic, volcanic, desert, cloudy, ringed,
  crystalline, and twilight worlds. System layouts, gravity, and cruising speeds
  vary within controlled limits; each orbit still grants one full revolution.
- Automatic pause when switching windows and reduced-motion support.
- Synthesized sound with no external assets, muted by default.

A regular capture earns 1 point. A **tangential capture** earns 2 points: the ball
must meet the next orbit within 30° of its tangent, measured at the actual contact
point. Consecutive tangential captures raise the reward by one point each, up to
6 points. A regular capture, such as a head-on dive toward the planet, resets the combo.
Aiming at the edge of the launch window is riskier, since a slightly wider shot misses.

In Expedition, stars reward tangential captures: ★ for finishing the system,
★★ when at least a third of its captures are tangential, and ★★★ for at least
two thirds. Route dots under the score light up mint for each tangential capture,
and the victory screen shows how many more were needed for the next star.

## Endless encounters

- **Spare attempt:** a violet diamond appears above planet 30. It is a physical
  pickup inside the initial orbit: wait for shrinking and cross it with the ball.
  Only one spare can be held. Failure automatically consumes it and returns the
  ball to the last planet with a fresh orbit; score remains, the tangent combo resets.
  The next pickup appears 30 planets after the spare is spent. If a pickup is left
  behind, the next opportunity is 30 planets later. Holding a spare suppresses new
  pickups, so they never stack.
- **Golden ring:** every fifth planet has a fixed gold annulus from the planet
  surface up to halfway toward its original orbit, spanning 0–50% of that radial gap. Launch while
  the ball is inside this band, at any angle, then catch the next planet to double
  that jump's points, including any tangent combo reward. Merely crossing the
  band does not award points. The ordinary mint aim window remains visible.
- **Shrinking-orbit points:** each full physical revolution after the initial
  grace revolution earns 1 point. Partial turns carry through saves and pauses;
  loading never awards the same turn twice. Arrival easing and either rotation
  direction count correctly. These points are separate from the launch reward
  and stay at +1 even inside the gold ring. No points are awarded for travel after
  a gravity collision. A spare attempt starts a fresh grace turn on revival.
- **Meteor showers:** from planet 31, eligible transfers have a 30% chance of a
  visible moving meteor stream. Showers never occur on consecutive transfers.
  A wide repeating gap gives time to launch and reach the next orbit. Rocks have
  swept collisions with the moving ball; both weather and motion pause together.
  A held spare also rescues a meteor collision. These events do not occur in
  Expedition.

Pickups, the spare slot, its cooldown, pending doubled points, and active meteor
positions are included in automatic saves and exported backups. Older saves
resume without granting an unearned spare or rerolling a saved encounter.

## Progress and backups

Progress is stored in the current browser and origin using `localStorage`.
The game saves at captures, launches, pauses, and regular intervals during play.
Closing or reloading the page preserves a valid attempt; losing clears that attempt.
Previous high scores are migrated automatically. Old attempts in the three-system
repeating campaign retain their original system identity until the attempt ends;
new levels use the expanded catalog. Unlocks, records, and existing discoveries
are preserved. Catalog generation uses a fixed seed and bounded cache, so replaying
or reloading never replaces a fictional system's roster with a different one.

Open **Settings** using the gear in the galaxy. Use **Export save** to download a
JSON backup and **Import save**
to restore it or move progress between the local preview and GitHub Pages. Importing
merges level unlocks, records, and discoveries without reducing existing progress.
If browser storage is unavailable, the menu explains how to export a backup.
Clearing browser data removes local saves; backups remain usable.

**Start from scratch** in Settings resets the expedition, records, discoveries,
and first-flight briefing. The prior save remains recoverable through **Restore
the save from before reset**. Each reset with any progress replaces that backup
with the latest save; resetting an already empty profile keeps the existing backup.
Restoring is a rollback: it replaces the current profile instead of merging into it.
Reset creates a separate storage epoch so an older
open tab cannot resurrect cleared progress. Older builds continue writing to their
old key; current builds adopt the latest epoch. Normal saves do not erase records
or unlocks from another tab in the same epoch.

## Atlas sources

The first 11 systems use real planet names and orbital order. Sizes, colors,
distances, gravity, and the route to a star are adapted for gameplay. The inward
spiral is a game route, not measured stellar positions or a claim that nearby
stars actually lie along a path toward the galactic center. All real systems in
the catalog are in the Milky Way. Exoplanet appearances are artistic interpretations. The fictional
catalog is a game setting, with no claim that its systems or surface details exist.

- [NASA: Solar System planets](https://science.nasa.gov/solar-system/planets/)
- [NASA: Proxima Centauri and its distance](https://science.nasa.gov/universe/exoplanets/eso-discovers-earth-size-planet-in-habitable-zone-of-nearest-star/)
- [NASA: Proxima Centauri d](https://science.nasa.gov/exoplanet-catalog/proxima-centauri-d/)
- [NASA Exoplanet Archive: Barnard's Star orbital order](https://exoplanetarchive.ipac.caltech.edu/overview/Barnard%20b)
- [NASA: Ross 128 b](https://science.nasa.gov/universe/exoplanets/discovery-alert-eso-finds-second-closest-earth-size-planet-in-habitable-zone/)
- [NASA: TRAPPIST-1 orbit comparison](https://science.nasa.gov/asset/webb/trappist-1-system-orbit-comparison/)
- [NASA: Kepler-90 and the eighth planet](https://science.nasa.gov/universe/exoplanets/discovery-of-eight-planets-makes-alien-system-the-first-to-tie-with-our-solar-system/)
- [AAS: orbital order of Kepler-90](https://baas.aas.org/pub/2020n6i309p01/release/1)
- [NASA: Kepler-11](https://www.nasa.gov/news-release/nasa-finds-earth-size-planet-candidates-in-habitable-zone-six-planet-system/)
- [NASA: Kepler-62](https://science.nasa.gov/photojournal/kepler-62-and-the-solar-system/)
- [NASA: Kepler-186](https://science.nasa.gov/photojournal/kepler-186-and-the-solar-system/)
- [ESO: TOI-178](https://www.eso.org/public/news/eso2102/)
- [ESA: HD 110067](https://www.esa.int/Science_Exploration/Space_Science/Cheops/ESA_s_Cheops_helps_unlock_rare_six-planet_system)
- [NASA: galaxy types](https://science.nasa.gov/universe/galaxies/types/)
- [NASA: Andromeda](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/)

## Validation

With Node.js available, run `node tests/game.cjs`. It checks full-revolution grace,
entry transitions and interruption, save/reload and older attempt migration,
all 1,001 catalog identities and deterministic generation, 13 inward spirals with
77 sectors and three full turns each, nearby-system ordering, galaxy navigation
and core transitions, bounded catalog navigation,
interactive sector details and map movement, first-flight briefing and its saved
completion flag, reversible resets and stale-tab protection, campaign completion
through added real and sampled fictional systems, the final
level boundary, atlas discovery, save import validation, old-cycle migration,
intact planet departure, unavailable storage, and tangent capture accuracy.
It also checks shrinking-orbit pickup contact at 20–144 FPS, one-slot spare
attempts and cooldowns, revival and old-save migration, regular and tangential
double-score launches, meteor collisions, pause/reload, safe weather windows,
and the launch-opening forecast in both orbit directions.
The radial gold band is checked at every launch angle and both boundaries.
Tangential captures are checked in both orbit directions, at the 30° boundary,
for combo growth and reset, star thresholds, and route history across saves.
Shrinking-turn scores are checked across frame rates, partial-turn saves,
multiple turns in one frame, impact boundaries, and separate Expedition scoring.

## GitHub Pages

In the repository settings, open **Pages → Deploy from a branch** and choose
**main** and **/ (root)**. GitHub displays the game URL once deployment is complete.

The game has no dependencies, external fonts, external images, or network requests.
