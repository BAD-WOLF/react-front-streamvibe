import {SessionContext, type SessionValue} from '@shared/auth/sessionContext.ts';
import {useContext} from 'react';

export function useSession(): SessionValue {
    const session: SessionValue | null = useContext(SessionContext);
    if (session === null) throw new Error('useSession must be used inside <SessionProvider>');
    return session;
}
