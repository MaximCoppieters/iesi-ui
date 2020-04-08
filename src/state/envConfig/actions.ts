import { createAction } from '../index';
import { StateChangeNotification } from '../../models/state.models';
import { AsyncStatus } from '../../snipsonian/observable-state/src/actionableStore/entities/types';
import { getTranslationLabelOverrides } from './selectors';
import { overrideTranslationsIfAny } from '../../views/translations';

// TODO reduce the boilerplate with an 'entities' mechanism?
// (or is this the exception because we keep it out of the 'entities' state part?)

/* eslint-disable no-param-reassign */

export const fetchEnvConfig = () => createAction<{}>({
    type: 'FETCH_ENV_CONFIG',
    payload: {},
    async process({ getState, setState, api, produce }) {
        try {
            /* for if they were stored in browser storage */
            overrideTranslationsIfAny(getTranslationLabelOverrides(getState()));

            setState({
                newState: produce(getState(), (draftState) => {
                    draftState.envConfig.fetch.status = AsyncStatus.Busy;
                }),
                notificationsToTrigger: [StateChangeNotification.ENV_CONFIG],
            });

            const envConfigData = await api.envConfig.fetchEnvironmentConfig();

            setState({
                newState: produce(getState(), (draftState) => {
                    draftState.envConfig.fetch.status = AsyncStatus.Success;
                    draftState.envConfig.data = envConfigData;
                }),
                notificationsToTrigger: [StateChangeNotification.ENV_CONFIG],
            });

            overrideTranslationsIfAny(getTranslationLabelOverrides(getState()));
        } catch (error) {
            setState({
                newState: produce(getState(), (draftState) => {
                    draftState.envConfig.fetch.status = AsyncStatus.Error;
                    draftState.envConfig.fetch.error = error;
                }),
                notificationsToTrigger: [StateChangeNotification.ENV_CONFIG],
            });
        }
    },
});
