# Examples README

## Examples

You really want to do things the way 'iotdb_*.js' does them.
The module needs to be installed using

    $ homestar install homestar-gpio

The 'connect_*.js' are really for development testing. 
They mostly bypass IOTDB code paths.

## IO
### Raspberry Pi

For the examples to work:

* Connect an input (e.g. a button) to Raspberry Pi Pin 35 (BCM Pin 19)
* Optional input to Raspberry Pi Pin 37 (BCM 26)
* Connect an LED or other output to Raspberry Pi Pin 33 (BCM Pin 13)

Note how the Raspberry Pi has a really messy pin system:
http://raspberrypi.stackexchange.com/questions/12966/what-is-the-difference-between-board-and-bcm-for-gpio-pin-numbering

### Other platforms

Coming…
