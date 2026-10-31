---
tags: [glossary, domain]
---
# Glossary

The words of the Swiss Wall Printing domain, as the code and the vault use them. Code names follow these terms. Implementation details go in the specs and `CLAUDE.md`, not here.

## Configurator

**Configuration**:
What the visitor set in the configurator: the room, the wall, the image, the print size and position, the fit, and the environment. It is always valid under the product rules.
_Avoid_: config, settings, design

**Product rule**:
A limit the client sets on valid configurations, for example "outdoors there is one wall" or "whole image is turned off for now".
_Avoid_: constraint, validation

**Share link**:
The address that carries a configuration, so the visitor can send it or come back to it. It never carries an uploaded image.
_Avoid_: permalink, deep link
