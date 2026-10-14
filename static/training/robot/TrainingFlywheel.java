package frc.robot.subsystems.training;

import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.signals.NeutralModeValue;
import frc.DELib26.motors.MasterMotorConstants;
import frc.DELib26.subsystems.motorSubsystems.motorBase.MotorSubsystemConfiguration;
import frc.DELib26.subsystems.motorSubsystems.motorBase.MotorSubsystemTalon;
import frc.DELib26.subsystems.motorSubsystems.motorBase.mechanismSim.DCMotorMechanismSim.DCMotorMechanismSimConfig;
import frc.DELib26.util.RunMode;

public final class TrainingFlywheel extends MotorSubsystemTalon {
    public TrainingFlywheel() {
        super(createConfiguration());
    }

    private static MotorSubsystemConfiguration createConfiguration() {
        if (!RunMode.isSim()) {
            throw new IllegalStateException("TrainingFlywheel is simulation-only");
        }
        TalonFXConfiguration motor = new TalonFXConfiguration();
        motor.Feedback.SensorToMechanismRatio = 1.0;
        motor.MotorOutput.NeutralMode = NeutralModeValue.Coast;
        motor.Slot0.kP = 0.1;
        motor.Slot0.kV = 0.12;

        return new MotorSubsystemConfiguration()
            .withName("TrainingFlywheel")
            .withMaster(new MasterMotorConstants(50, "rio", true, motor))
            .withRotationsPerPositionUnit(1.0)
            .withConventionalPerSubsystemUnit(1.0)
            .withMechanismType(MotorSubsystemConfiguration.MechanismType.ANGULAR)
            .withAllowableError(2.0)
            .withMechanismSimConfig(new DCMotorMechanismSimConfig(0.002, 0.1));
    }
}
