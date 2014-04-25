// function I2C(opts) {

//   if (!(this instanceof I2C)) {
//     return new I2C(opts);
//   }

//   var io;

//   io = opts.io;

//   /**
//    * Write multiple bits in an 8-bit device register.
//    * @param address I2C slave device address
//    * @param register Register regAddr to write to
//    * @param bitStart First bit position to write (0-7)
//    * @param length Number of bits to write (not more than 8)
//    * @param data Right-aligned value to write
//    * @param callback Callback function to call on completition.
//    */
//   this.writeBits = function(address, register, bitStart, length, data, callback) {

//     // From I2CDev:
//     //
//     //  bool I2Cdev::writeBits(uint8_t devAddr, uint8_t regAddr, uint8_t bitStart, uint8_t length, uint8_t data) {
//     //     //      010 value to write
//     //     // 76543210 bit numbers
//     //     //    xxx   args: bitStart=4, length=3
//     //     // 00011100 mask byte
//     //     // 10101111 original value (sample)
//     //     // 10100011 original & ~mask
//     //     // 10101011 masked | value
//     //     uint8_t b;
//     //     if (readByte(devAddr, regAddr, &b) != 0) {
//     //         uint8_t mask = ((1 << length) - 1) << (bitStart - length + 1);
//     //         data <<= (bitStart - length + 1); // shift data into correct position
//     //         data &= mask; // zero all non-important bits in data
//     //         b &= ~(mask); // zero all important bits in existing byte
//     //         b |= data; // combine data with existing byte
//     //         return writeByte(devAddr, regAddr, b);
//     //     } else {
//     //         return false;
//     //     }
//     // }

//     var mask;

//     io.sendI2CWriteRequest(address, register);
//     io.sendI2CReadRequest(address, 1, function(value) {

//       var mask;

//       if (value != 0) {

//         mask = ((1 << length) - 1) << (bitStart - length + 1);
//         data = data << (bitStart - length + 1);
//         data = data & mask;
//         value = value & ~(mask);
//         value = value | data;

//         io.sendI2CWriteRequest(address, register);
//         io.sendI2CWriteRequest(address, value);

//         callback(true);
//       } else {
//         callback(false);
//       }

//     });
//   };



//   *
//    * Write a single bit in an 8-bit device register.
//    * @param devAddr I2C slave device address
//    * @param regAddr Register regAddr to write to
//    * @param bitNum Bit position to write (0-7)
//    * @param value New bit value to write
//    * @return Status of operation (true = success)

//   this.writeBit = function(address, register, bit, data, callback) {

//     /*
//      * From I2CDev
//      * bool I2Cdev::writeBit(uint8_t devAddr, uint8_t regAddr, uint8_t bitNum, uint8_t data) {
//      *   uint8_t b;
//      *   readByte(devAddr, regAddr, &b);
//      *   b = (data != 0) ? (b | (1 << bitNum)) : (b & ~(1 << bitNum));
//      *   return writeByte(devAddr, regAddr, b);
//      * }
//      */


//     io.sendI2CWriteRequest(address, register);
//     io.sendI2CReadRequest(address, 1, function(value) {

//         if (data != 0) {
//           value = value | (1 << bit)
//         } else {
//           value = value & ~(1 << bit)
//         }

//         io.sendI2CWriteRequest(address, register);
//         io.sendI2CWriteRequest(address, value);

//         callback();
//       }
//     };

//     /** Read multiple bytes from an 8-bit device register.
//      * @param devAddr I2C slave device address
//      * @param regAddr First register regAddr to read from
//      * @param length Number of bytes to read
//      * @param data Buffer to store read data in
//      * @param timeout Optional read timeout in milliseconds (0 to disable, leave off to use default class value in I2Cdev::readTimeout)
//      * @return Number of bytes read (-1 indicates failure)
//      */
//     this.readBytes = function(address, register, length, data, callback) {

//       io.sendI2CWriteRequest(address, register);
//       io.sendI2CReadRequest(address, callback);
//     };

//     /** Read multiple bytes from an 8-bit device register.
//      * @param devAddr I2C slave device address
//      * @param regAddr First register regAddr to read from
//      * @param length Number of bytes to read
//      * @param data Buffer to store read data in
//      * @param timeout Optional read timeout in milliseconds (0 to disable, leave off to use default class value in I2Cdev::readTimeout)
//      * @return Number of bytes read (-1 indicates failure)
//      */
//     this.readByte = function(address, register, data, callback) {
//       readByte(address, register, 1, data, callback);
//     };



//   }
