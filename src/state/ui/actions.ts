import { createAction, getStore } from 'state';
import { StateChangeNotification } from 'models/state.models';
import { ListFilters, ISortedColumn } from 'models/list.models';
import { ITriggerFlashMessagePayload } from 'models/state/ui.models';
import { SnackbarKey } from 'notistack';
import { isExecutionRequestStatusPending } from 'utils/scripts/executionRequests';
import { ROUTE_KEYS } from 'views/routes';
import { IColumnNames as IScriptsColumnNames } from 'models/state/scripts.models';
import { IColumnNames as IExecutionsColumnNames } from 'models/state/executionRequests.models';

export const triggerFlashMessage = (payload: ITriggerFlashMessagePayload) => createAction<ITriggerFlashMessagePayload>({
    type: 'TRIGGER_FLASH_MESSAGE',
    payload,
    process({ setStateImmutable, action }) {
        setStateImmutable({
            toState: (draftState) => {
                const options = action.payload.options || {};
                draftState.ui.flashMessages.push({
                    translationKey: action.payload.translationKey,
                    translationPlaceholders: action.payload.translationPlaceholders,
                    navigateToRoute: action.payload.navigateToRoute,
                    options: {
                        ...options,
                        variant: action.payload.type || 'default',
                    },
                    dismissed: false,
                    key: new Date().getMilliseconds(),
                });
            },
            notificationsToTrigger: [StateChangeNotification.FLASH_MESSAGES],
        });
    },
});

export const closeFlashMessage = (payload: { key: SnackbarKey }) => createAction<{ key: SnackbarKey }>({
    type: 'CLOSE_FLASH_MESSAGE',
    payload,
    process({ setStateImmutable, action }) {
        setStateImmutable({
            toState: (draftState) => {
                const flashMessage = draftState.ui.flashMessages.find((item) => item.key === action.payload.key);
                if (flashMessage) {
                    flashMessage.dismissed = true;
                }
            },
            notificationsToTrigger: [StateChangeNotification.FLASH_MESSAGES],
        });
    },
});

export const removeFlashMessage = (payload: { key: SnackbarKey }) => createAction<{ key: SnackbarKey }>({
    type: 'REMOVE_FLASH_MESSAGE',
    payload,
    process({ setStateImmutable, action }) {
        setStateImmutable({
            toState: (draftState) => {
                const index = draftState.ui.flashMessages.findIndex((item) => item.key === action.payload.key);
                if (index !== -1) {
                    draftState.ui.flashMessages.splice(index, 1);
                }
            },
            notificationsToTrigger: [StateChangeNotification.FLASH_MESSAGES],
        });
    },
});

export const addPollingExecutionRequest = (payload: { id: string }) => createAction<{ id: string }>({
    type: 'ADD_POLLING_EXECUTION_REQUEST',
    payload,
    process({ setStateImmutable, action }) {
        setStateImmutable({
            toState: (draftState) => {
                draftState.ui.pollingExecutionRequestIds.push(action.payload.id);
            },
            notificationsToTrigger: [StateChangeNotification.POLLING_EXECUTION_REQUESTS],
        });
    },
});

export const removePollingExecutionRequest = (payload: { id: string }) => createAction<{ id: string }>({
    type: 'REMOVE_POLLING_EXECUTION_REQUEST',
    payload,
    process({ setStateImmutable, action }) {
        setStateImmutable({
            toState: (draftState) => {
                const index = draftState.ui.pollingExecutionRequestIds.findIndex((id) => id === action.payload.id);
                if (index !== -1) {
                    draftState.ui.pollingExecutionRequestIds.splice(index, 1);
                }
            },
            notificationsToTrigger: [StateChangeNotification.POLLING_EXECUTION_REQUESTS],
        });
    },
});

export const checkPollingExecutionRequests = () => createAction<{}>({
    type: 'CHECK_POLLING_EXECUTION_REQUESTS',
    payload: {},
    async process({ getState, api }) {
        const { dispatch } = getStore();

        try {
            const state = getState();
            await state.ui.pollingExecutionRequestIds.forEach(async (id) => {
                const executionRequestData = await api.executionRequests.fetchExecutionRequest({ id });
                if (!isExecutionRequestStatusPending(executionRequestData.executionRequestStatus)) {
                    dispatch(triggerFlashMessage({
                        translationKey: 'flash_messages.execution_request.run_finished',
                        translationPlaceholders: {
                            scriptName: executionRequestData.name,
                        },
                        type: 'info',
                        navigateToRoute: {
                            routeKey: ROUTE_KEYS.R_REPORT_DETAIL,
                            params: { executionRequestId: id },
                        },
                    }));
                    dispatch(removePollingExecutionRequest({ id }));
                }
            });
        } catch (error) {
            dispatch(triggerFlashMessage({ translationKey: 'error.fetch_env', type: 'error' }));
        }
    },
});

export const setScriptsListFilter = (payload: {
    filters?: ListFilters<Partial<IScriptsColumnNames>>;
    onlyShowLatestVersion?: boolean;
    page?: number;
    sortedColumn?: ISortedColumn<IScriptsColumnNames>;
}) => createAction<{
    filters?: ListFilters<Partial<IScriptsColumnNames>>;
    onlyShowLatestVersion?: boolean;
    page?: number;
    sortedColumn?: ISortedColumn<IScriptsColumnNames>;
}>({
    type: 'UPDATE_SCRIPTS_LIST_FILTER',
    payload,
    process({ setStateImmutable }) {
        setStateImmutable({
            toState: (draftState) => {
                // eslint-disable-next-line no-param-reassign
                draftState.ui.listFilters.scripts = {
                    filters: payload.filters || draftState.ui.listFilters.scripts.filters,
                    onlyShowLatestVersion: typeof payload.onlyShowLatestVersion !== 'undefined'
                        ? payload.onlyShowLatestVersion
                        : draftState.ui.listFilters.scripts.onlyShowLatestVersion,
                    page: payload.page || draftState.ui.listFilters.scripts.page,
                    sortedColumn: payload.sortedColumn || draftState.ui.listFilters.scripts.sortedColumn,
                };
            },
            notificationsToTrigger: [StateChangeNotification.LIST_FILTER_SCRIPTS],
        });
    },
});

export const setExecutionsListFilter = (payload: {
    filters?: ListFilters<Partial<IExecutionsColumnNames>>;
    page?: number;
    sortedColumn?: ISortedColumn<IExecutionsColumnNames>;
}) => createAction<{
    filters?: ListFilters<Partial<IExecutionsColumnNames>>;
    page?: number;
    sortedColumn?: ISortedColumn<IExecutionsColumnNames>;
}>({
    type: 'UPDATE_EXECUTIONS_LIST_FILTER',
    payload,
    process({ setStateImmutable }) {
        setStateImmutable({
            toState: (draftState) => {
                // eslint-disable-next-line no-param-reassign
                draftState.ui.listFilters.executions = {
                    filters: payload.filters || draftState.ui.listFilters.executions.filters,
                    page: payload.page || draftState.ui.listFilters.executions.page,
                    sortedColumn: payload.sortedColumn || draftState.ui.listFilters.executions.sortedColumn,
                };
            },
            notificationsToTrigger: [StateChangeNotification.LIST_FILTER_EXECUTIONS],
        });
    },
});
