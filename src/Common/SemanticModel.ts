/* eslint-disable semi */
import Targets from '../SemanticModel/Targets';
import Trigger from '../SemanticModel/Trigger';
import Variables from '../SemanticModel/Variables';
import Stage from './Stage';

export default interface SemanticModel {
    getTargets(): Targets;
    getVariables(): Variables;
    getTrigger(): Trigger;
    getStages(): Stage[];
}