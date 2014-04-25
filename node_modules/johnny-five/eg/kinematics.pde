float XPosition[2] = {80, 80};                        //place x positions
float ZPosition[2] = {35,60};                         //place z positions
float X0;                                                    //used to enter inside function calcul angles
float Z0;                                                    //used to enter inside function calcul angles
int pulsewidth1;
int pulsewidth2;

void setup() {

Serial.begin (115200);

Serial.println ("#0 P680 #3 P2013 #4 P1500 #11 P1500 #12 P2013 #15 P680 T800" );      //Set servos to starting position
Serial.println ("#16 P680 #19 P2013 #20 P1500 #27 P1500 #28 P2013 #31 P680 T800");

delay (2000);
}

void loop() {

  for (int i = 0; i <= 1; i++){
    X0 = XPosition[i];
    Z0 = ZPosition[i];
    calculAngles (X0, Z0);                                     // Calls function Calcul angles
    moveservo (0, pulsewidth1, 800);                     // Calls function to move the servo
    moveservo (15, pulsewidth1, 800);
    moveservo (16, pulsewidth1, 800);
    moveservo (31, pulsewidth1, 800);

    moveservo (3, pulsewidth2, 800);
    moveservo (12, pulsewidth2, 800);
    moveservo (19, pulsewidth2, 800);
    moveservo (28, pulsewidth2, 800);
    delay (800);
  }
}

void calculAngles(float X0, float Y0) {
  const float a = 70;                                             //this value is known (femur)
  const float b = 111;                                           //this value is known (tibia)
  float hypo;
  float alpha;
  const float pi=3.141592653;
  float beta;
  float gamma;
  float delta;
  float epsilon;
  float roundBeta; //to round value before convert from float to int
  float roundEpsilon;

  hypo = sqrt((sq(X0) + sq(Z0)));

  alpha = (acos((sq(a)+sq(hypo)-sq(b))/(2*a*hypo)))*180/pi;                // cosines law in degrees
  gamma = (atan2(Z0,X0))*180/pi;
  beta = 90 - alpha + gamma;
  Serial.print ("Beta = ");                                                              // prints this text in the serial monitor
  Serial.println (beta);                                                                  // prints beta value in serial monitor
  delta = (acos((sq(a)+sq(b)-sq(hypo))/(2*a*b)))*180/pi;
  epsilon = 180 - delta;
  Serial.print ("Epsilon = ");
  Serial.println(epsilon);
  roundBeta = lround((beta*11)+560);                                             // convert angle to pulsewidth and rounds it
  roundEpsilon = lround ((epsilon*11)+560);

  pulsewidth1 = (int)roundBeta;
  pulsewidth2 = (int)roundEpsilon;
}

void moveservo (int servo, int positions, int time) {

  Serial.print ("#");
  Serial.print (servo);
  Serial.print (" P");
  Serial.print (positions);
  Serial.print (" T");
  Serial.println (time);
}
