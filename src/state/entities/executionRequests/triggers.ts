import entitiesStateManager from 'state/entities/entitiesStateManager';
import { ASYNC_ENTITY_KEYS } from 'models/state/entities.models';
import { ICreateExecutionRequestPayload, IExecutionRequestByIdPayload } from 'models/state/executionRequests.models';
import { StateChangeNotification } from 'models/state.models';

export const triggerFetchExecutionRequests = (filter: object = {}) =>
    entitiesStateManager.triggerAsyncEntityFetch<{}>({
        asyncEntityToFetch: {
            asyncEntityKey: ASYNC_ENTITY_KEYS.executionRequests,
            refreshMode: 'always',
            resetDataOnTrigger: false,
        },
        extraInputSelector: () => filter,
        notificationsToTrigger: [StateChangeNotification.EXECUTION_REQUESTS_LIST],
    });

export const triggerFetchExecutionRequestDetail = (payload: IExecutionRequestByIdPayload) =>
    entitiesStateManager.triggerAsyncEntityFetch<{}>({
        asyncEntityToFetch: {
            asyncEntityKey: ASYNC_ENTITY_KEYS.executionRequestDetail,
            refreshMode: 'always',
            resetDataOnTrigger: true,
        },
        extraInputSelector: () => payload,
        notificationsToTrigger: [StateChangeNotification.EXECUTION_REQUESTS_DETAIL],
    });

export const triggerCreateExecutionRequest = (payload: ICreateExecutionRequestPayload) =>
    entitiesStateManager.triggerAsyncEntityCreate<{}>({
        asyncEntityToCreate: {
            asyncEntityKey: ASYNC_ENTITY_KEYS.executionRequestDetail,
        },
        extraInputSelector: () => payload,
        notificationsToTrigger: [StateChangeNotification.EXECUTION_REQUESTS_CREATE],
    });
