import isSet from '@snipsonian/core/es/is/isSet';
import { IObservableStateAction } from '@snipsonian/observable-state/es/actionableStore/types';
import { createObservableStateAction } from '@snipsonian/observable-state/es/actionableStore/actionCreators';
import {
    TNrOfParentNotificationLevelsToTrigger,
} from '@snipsonian/observable-state/es/observer/extendNotificationsToTrigger';
import {
    AsyncOperation,
    IAsyncEntity,
    TEntityKey,
    IEntitiesInitialState,
    IWithKeyIndex,
} from './types';
import { asyncEntityFetch } from './asyncEntityUpdaters';

export interface IAsyncEntityActionCreators<ActionType, State, ExtraProcessInput, StateChangeNotificationKey> {
    createAsyncEntityAction<ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>(
        // eslint-disable-next-line max-len
        props: ICreateUpdateAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>
        // eslint-disable-next-line max-len
    ): IObservableStateAction<ActionType, IAsyncEntityActionPayload, State, ExtraProcessInput, StateChangeNotificationKey>;

    updateAsyncEntityAction<ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>(
        // eslint-disable-next-line max-len
        props: ICreateUpdateAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>
        // eslint-disable-next-line max-len
    ): IObservableStateAction<ActionType, IAsyncEntityActionPayload, State, ExtraProcessInput, StateChangeNotificationKey>;

    removeAsyncEntityAction<ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>(
        // eslint-disable-next-line max-len
        props: ICreateRemoveAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>
        // eslint-disable-next-line max-len
    ): IObservableStateAction<ActionType, IAsyncEntityActionPayload, State, ExtraProcessInput, StateChangeNotificationKey>;

    fetchAsyncEntityAction<ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>(
        // eslint-disable-next-line max-len
        props: ICreateFetchAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>
        // eslint-disable-next-line max-len
    ): IObservableStateAction<ActionType, IAsyncEntityActionPayload, State, ExtraProcessInput, StateChangeNotificationKey>;
}

interface ICreateAsyncEntityActionPropsBase
<State, StateChangeNotificationKey, ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult> {
    asyncEntityKey: TEntityKey;
    extraInput?: ExtraInput;
    api: (apiInput: ApiInput) => Promise<ApiResponse>;
    apiInputSelector?: (props: { state: State; extraInput?: ExtraInput }) => ApiInput;
    mapApiResponse?: (props: { response: ApiResponse; state: State }) => ApiResult;
    notificationsToTrigger: StateChangeNotificationKey[];
    nrOfParentNotificationLevelsToTrigger?: TNrOfParentNotificationLevelsToTrigger;
}

interface ICreateFetchAsyncEntityActionProps
<State, StateChangeNotificationKey, ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>
    extends ICreateAsyncEntityActionPropsBase
    <State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse> {

    resetDataOnTrigger?: boolean; // default true
}

interface ICreateUpdateAsyncEntityActionProps
<State, StateChangeNotificationKey, ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>
    extends ICreateAsyncEntityActionPropsBase
    <State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse> {

    updateDataOnSuccess?: boolean; // default false
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ICreateRemoveAsyncEntityActionProps
<State, StateChangeNotificationKey, ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>
    extends ICreateAsyncEntityActionPropsBase
    <State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse> {}

interface IAsyncEntityActionPayload {
    operation: AsyncOperation;
}

// eslint-disable-next-line max-len
export function initAsyncEntityActionCreators<State, ExtraProcessInput, ActionType = string, StateChangeNotificationKey = string>({
    entitiesStateField = 'entities',
    entitiesInitialState,
}: {
    entitiesStateField?: string;
    entitiesInitialState: IEntitiesInitialState;
}): IAsyncEntityActionCreators<ActionType, State, ExtraProcessInput, StateChangeNotificationKey> {
    return {
        createAsyncEntityAction: <ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>({
            asyncEntityKey,
            extraInput = ({} as ExtraInput),
            api,
            apiInputSelector,
            mapApiResponse,
            notificationsToTrigger,
            nrOfParentNotificationLevelsToTrigger,
            updateDataOnSuccess = false,
            // eslint-disable-next-line max-len
        }: ICreateUpdateAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>) =>
            createAsyncEntityActionBase({
                asyncEntityKey,
                extraInput,
                api,
                apiInputSelector,
                mapApiResponse,
                notificationsToTrigger,
                nrOfParentNotificationLevelsToTrigger,
                operation: AsyncOperation.create,
                resetDataOnTrigger: false,
                updateDataOnSuccess,
            }),

        updateAsyncEntityAction: <ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>({
            asyncEntityKey,
            extraInput = ({} as ExtraInput),
            api,
            apiInputSelector,
            mapApiResponse,
            notificationsToTrigger,
            nrOfParentNotificationLevelsToTrigger,
            updateDataOnSuccess = false,
            // eslint-disable-next-line max-len
        }: ICreateUpdateAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>) =>
            createAsyncEntityActionBase({
                asyncEntityKey,
                extraInput,
                api,
                apiInputSelector,
                mapApiResponse,
                notificationsToTrigger,
                nrOfParentNotificationLevelsToTrigger,
                operation: AsyncOperation.update,
                resetDataOnTrigger: false,
                updateDataOnSuccess,
            }),

        removeAsyncEntityAction: <ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>({
            asyncEntityKey,
            extraInput = ({} as ExtraInput),
            api,
            apiInputSelector,
            notificationsToTrigger,
            nrOfParentNotificationLevelsToTrigger,
            // eslint-disable-next-line max-len
        }: ICreateRemoveAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>) =>
            createAsyncEntityActionBase({
                asyncEntityKey,
                extraInput,
                api,
                apiInputSelector,
                mapApiResponse: () => entitiesInitialState[asyncEntityKey].data,
                notificationsToTrigger,
                nrOfParentNotificationLevelsToTrigger,
                operation: AsyncOperation.remove,
                resetDataOnTrigger: false,
                updateDataOnSuccess: true,
            }),

        // TODO (but e.g. without always storing the response on success in the data)
        fetchAsyncEntityAction: <ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>({
            asyncEntityKey,
            extraInput = ({} as ExtraInput),
            api,
            apiInputSelector,
            mapApiResponse,
            notificationsToTrigger,
            nrOfParentNotificationLevelsToTrigger,
            resetDataOnTrigger = true,
            // eslint-disable-next-line max-len
        }: ICreateFetchAsyncEntityActionProps<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse>) =>
            createAsyncEntityActionBase({
                asyncEntityKey,
                extraInput,
                api,
                apiInputSelector,
                mapApiResponse,
                notificationsToTrigger,
                nrOfParentNotificationLevelsToTrigger,
                operation: AsyncOperation.fetch,
                resetDataOnTrigger,
                updateDataOnSuccess: true,
            }),
    };

    function createAsyncEntityActionBase<ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult>({
        asyncEntityKey,
        extraInput,
        api,
        apiInputSelector,
        mapApiResponse,
        notificationsToTrigger,
        nrOfParentNotificationLevelsToTrigger,
        operation,
        resetDataOnTrigger,
        updateDataOnSuccess,
        // eslint-disable-next-line max-len
    }: ICreateAsyncEntityActionPropsBase<State, StateChangeNotificationKey, ExtraInput, ApiInput, ApiResult, ApiResponse> & {
        operation: AsyncOperation;
        resetDataOnTrigger: boolean;
        updateDataOnSuccess: boolean;
    }) {
        // eslint-disable-next-line max-len
        return createObservableStateAction<ActionType, IAsyncEntityActionPayload, State, ExtraProcessInput, StateChangeNotificationKey>({
            type: `${asyncEntityKey}_${operation.toUpperCase()}` as unknown as ActionType,
            payload: {
                operation,
                ...extraInput,
            },
            async process({ getState, setState }) {
                try {
                    // eslint-disable-next-line arrow-body-style
                    updateAsyncEntityInState((entity) => {
                        return resetDataOnTrigger
                            ? asyncEntityFetch.trigger(entity, entitiesInitialState[asyncEntityKey].data)
                            : asyncEntityFetch.triggerWithoutDataReset(entity);
                    });

                    const apiInput = isSet(apiInputSelector)
                        ? apiInputSelector({ state: getState(), extraInput })
                        : null;

                    const apiResponse = await api(apiInput);
                    const apiResult = isSet(mapApiResponse)
                        ? mapApiResponse({ response: apiResponse, state: getState() })
                        : apiResponse;

                    // eslint-disable-next-line arrow-body-style
                    updateAsyncEntityInState((entity) => {
                        return updateDataOnSuccess
                            ? asyncEntityFetch.succeeded(entity, apiResult)
                            : asyncEntityFetch.succeededWithoutDataSet(entity);
                    });
                } catch (error) {
                    updateAsyncEntityInState((entity) => asyncEntityFetch.failed(entity, error));
                }

                function updateAsyncEntityInState(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    entityUpdater: (currentEntity: IAsyncEntity<any>) => IAsyncEntity<any>,
                ) {
                    setState({
                        newState: (currentState) => {
                            const entity = (currentState as IWithKeyIndex)[entitiesStateField][asyncEntityKey];
                            return {
                                ...currentState,
                                [entitiesStateField]: {
                                    ...(currentState as IWithKeyIndex)[entitiesStateField],
                                    [asyncEntityKey]: entityUpdater(entity),
                                },
                            };
                        },
                        notificationsToTrigger,
                        nrOfParentNotificationLevelsToTrigger,
                    });
                }
            },
        });
    }
}
