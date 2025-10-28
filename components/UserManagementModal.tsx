import React, { useState } from 'react';
import { User, UserRole, Warehouse } from '../types';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { UsersIcon } from './icons/UsersIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  warehouses: Warehouse[];
  onSave: (users: User[]) => void;
  onDeleteUser: (userId: number) => void;
}

const UserManagementModal: React.FC<Props> = ({ isOpen, onClose, users, warehouses, onSave, onDeleteUser }) => {
  useEscapeKey(onClose);
  const [editableUsers, setEditableUsers] = useState<User[]>(JSON.parse(JSON.stringify(users)));
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', username: '', role: UserRole.Storekeeper, warehouseId: undefined });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  if (!isOpen) return null;
  
  const handleUserChange = (index: number, field: keyof User, value: any) => {
    const newUsers = [...editableUsers];
    const userToUpdate = { ...newUsers[index] };
    (userToUpdate as any)[field] = value;

    // If role is changed from Storekeeper, clear warehouseId
    if (field === 'role' && value !== UserRole.Storekeeper) {
        userToUpdate.warehouseId = undefined;
    }
    
    newUsers[index] = userToUpdate;
    setEditableUsers(newUsers);
  };
  
  const handleAddNewUser = () => {
    if(newUser.name.trim() && newUser.username.trim()){
        const userToAdd: User = {
            id: Date.now(),
            ...newUser
        };
        setEditableUsers(prev => [...prev, userToAdd]);
        setNewUser({ name: '', username: '', role: UserRole.Storekeeper, warehouseId: undefined });
        setIsAdding(false);
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
        onDeleteUser(userToDelete.id);
        // Also remove from the local editable state
        setEditableUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
    }
  };


  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-4xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <UsersIcon />
            مدیریت کاربران
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>

        <div className="flex-grow overflow-auto pr-2">
            <table className="w-full text-sm text-right">
                <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                    <tr>
                        <th className="p-2 font-medium">نام کامل</th>
                        <th className="p-2 font-medium">نام کاربری</th>
                        <th className="p-2 font-medium">نقش</th>
                        <th className="p-2 font-medium">انبار مرتبط</th>
                        <th className="p-2 font-medium">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                    {editableUsers.map((user, index) => (
                        <tr key={user.id}>
                            <td className="p-2"><input type="text" value={user.name} onChange={e => handleUserChange(index, 'name', e.target.value)} className="w-full p-1 rounded-md" /></td>
                            <td className="p-2"><input type="text" value={user.username} onChange={e => handleUserChange(index, 'username', e.target.value)} className="w-full p-1 rounded-md" /></td>
                            <td className="p-2">
                                <select value={user.role} onChange={e => handleUserChange(index, 'role', e.target.value)} className="w-full p-1.5 rounded-md">
                                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </td>
                            <td className="p-2">
                               {user.role === UserRole.Storekeeper ? (
                                    <select value={user.warehouseId || ''} onChange={e => handleUserChange(index, 'warehouseId', Number(e.target.value))} className="w-full p-1.5 rounded-md">
                                        <option value="">انتخاب انبار</option>
                                        {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                                    </select>
                               ) : (
                                   <span className="text-gray-400">N/A</span>
                               )}
                            </td>
                            <td className="p-2 text-center">
                                <button
                                    onClick={() => setUserToDelete(user)}
                                    disabled={user.role === UserRole.Admin}
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={user.role === UserRole.Admin ? "امکان حذف مدیر سیستم وجود ندارد" : "حذف کاربر"}
                                >
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {isAdding && (
                        <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                           <td className="p-2"><input type="text" placeholder="نام..." value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} className="w-full p-1 rounded-md" /></td>
                           <td className="p-2"><input type="text" placeholder="نام کاربری..." value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} className="w-full p-1 rounded-md" /></td>
                           <td className="p-2">
                               <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value as UserRole}))} className="w-full p-1.5 rounded-md">
                                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                               </select>
                           </td>
                           <td className="p-2">
                                {newUser.role === UserRole.Storekeeper && (
                                    <select value={newUser.warehouseId || ''} onChange={e => setNewUser(p => ({...p, warehouseId: Number(e.target.value)}))} className="w-full p-1.5 rounded-md">
                                        <option value="">انتخاب انبار</option>
                                        {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                                    </select>
                                )}
                           </td>
                           <td className="p-2"></td>
                        </tr>
                    )}
                </tbody>
            </table>
            {!isAdding ? (
                <button onClick={() => setIsAdding(true)} className="btn btn-secondary text-sm mt-4"><PlusIcon /> افزودن کاربر جدید</button>
            ) : (
                <div className="flex gap-2 mt-4">
                    <button onClick={handleAddNewUser} className="btn btn-primary text-sm">تایید</button>
                    <button onClick={() => setIsAdding(false)} className="btn btn-secondary text-sm">لغو</button>
                </div>
            )}
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-end gap-4">
          <button onClick={onClose} className="btn btn-secondary">انصراف</button>
          <button onClick={() => onSave(editableUsers)} className="btn btn-primary">ذخیره تغییرات</button>
        </div>
      </div>
    </div>

    {userToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 modal-backdrop-animation">
            <div className="bg-[var(--background-secondary)] p-6 rounded-lg shadow-xl animate-fade-in w-full max-w-md text-center">
                <h3 className="font-bold text-lg text-red-600">تایید حذف کاربر</h3>
                <p className="py-4 text-center">در صورتی که این کاربر را حذف کنید تمام جداول مرتبط با آن نیز حذف خواهند شد و قابل بازگشت نیست آیا مطمئن هستید؟</p>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => setUserToDelete(null)} className="btn btn-secondary w-24">خیر</button>
                    <button onClick={confirmDelete} className="btn btn-primary bg-red-600 hover:bg-red-700 w-32">بله، حذف کن</button>
                </div>
            </div>
         </div>
    )}
    </>
  );
};

export default UserManagementModal;