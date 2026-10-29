import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Plus,
  MapPin,
  Droplets,
  Calendar,
  Trash2,
  Edit,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';
import { Farm } from '../types';

export const FarmsPage: React.FC = () => {
  const { farms, createFarm, updateFarm, deleteFarm, setSelectedFarmId } = useFarms();
  const { language, t } = useLanguage();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formState, setFormState] = useState('Haryana');
  const [formDistrict, setFormDistrict] = useState('Karnal');
  const [formArea, setFormArea] = useState(3.0);
  const [formAreaUnit, setFormAreaUnit] = useState<'Acre' | 'Hectare' | 'Bigha'>('Acre');
  const [formSoil, setFormSoil] = useState('Loam');
  const [formIrrigation, setFormIrrigation] = useState<'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Tube Well' | 'Rainfed'>('Tube Well');
  const [formCropId, setFormCropId] = useState('wheat');
  const [formGrowthStage, setFormGrowthStage] = useState('Flowering / Boot Stage (70-80 DAS)');

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormName('');
    setFormState('Haryana');
    setFormDistrict('Karnal');
    setFormArea(3.0);
    setFormSoil('Loam');
    setFormIrrigation('Tube Well');
    setFormCropId('wheat');
    setShowAddModal(true);
  };

  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormName(farm.name);
    setFormState(farm.location.state);
    setFormDistrict(farm.location.district);
    setFormArea(farm.area);
    setFormAreaUnit(farm.areaUnit);
    setFormSoil(farm.soilType);
    setFormIrrigation(farm.irrigationMethod);
    setFormCropId(farm.currentCropId);
    setFormGrowthStage(farm.growthStage);
    setShowAddModal(true);
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFarm) {
      await updateFarm(editingFarm.id, {
        name: formName,
        location: { ...editingFarm.location, state: formState, district: formDistrict },
        area: formArea,
        areaUnit: formAreaUnit,
        soilType: formSoil,
        irrigationMethod: formIrrigation,
        currentCropId: formCropId,
        growthStage: formGrowthStage,
      });
    } else {
      await createFarm({
        name: formName,
        location: { state: formState, district: formDistrict },
        area: formArea,
        areaUnit: formAreaUnit,
        soilType: formSoil,
        irrigationMethod: formIrrigation,
        currentCropId: formCropId,
        growthStage: formGrowthStage,
        sowingDate: new Date().toISOString().split('T')[0],
        expectedHarvestDate: new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0],
      });
    }
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteFarm(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest dark:text-darkTextPrimary flex items-center gap-2">
            <Sprout className="w-7 h-7 text-agri" />
            <span>{t.navFarms}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText dark:text-darkTextSecondary">
            Manage your registered plots, crop growth stages, and field soil types
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-forest dark:bg-forest-light text-limeAccent font-bold text-xs sm:text-sm hover:bg-forest-light dark:hover:bg-agri transition-colors flex items-center gap-2 shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addFarm}</span>
        </button>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map(farm => {
          const crop = CROPS_DATABASE.find(c => c.id === farm.currentCropId) || CROPS_DATABASE[0];

          return (
            <div
              key={farm.id}
              className="bg-white dark:bg-darkCard rounded-3xl p-6 border border-gray-100 dark:border-darkBorder shadow-soft dark:shadow-dark-card hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-forest dark:text-darkTextPrimary hover:text-agri transition-colors">
                      {farm.name}
                    </h3>
                    <p className="text-xs text-secondaryText dark:text-darkTextSecondary flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-agri" />
                      {farm.location.district}, {farm.location.state}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 dark:bg-forest text-agri dark:text-limeAccent border border-green-200 dark:border-forest-light">
                    {farm.area} {farm.areaUnit}
                  </span>
                </div>

                {/* Details List */}
                <div className="space-y-2 py-3 my-2 border-y border-gray-100 dark:border-darkBorder text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondaryText dark:text-darkTextSecondary">Current Crop:</span>
                    <span className="font-bold text-forest dark:text-limeAccent">
                      {crop.nameEn} ({crop.nameHi})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-secondaryText dark:text-darkTextSecondary">Growth Stage:</span>
                    <span className="font-semibold text-darkText dark:text-darkTextPrimary truncate max-w-[170px]" title={farm.growthStage}>
                      {farm.growthStage}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-secondaryText dark:text-darkTextSecondary">Soil & Irrigation:</span>
                    <span className="font-semibold text-darkText dark:text-darkTextPrimary">
                      {farm.soilType} • {farm.irrigationMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-3 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(farm)}
                    className="p-2 text-gray-500 hover:text-forest dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-darkSurface"
                    title="Edit Farm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(farm.id)}
                    className="p-2 text-gray-500 hover:text-criticalRed dark:text-gray-400 dark:hover:text-criticalRed rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete Farm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to={`/farms/${farm.id}`}
                  onClick={() => setSelectedFarmId(farm.id)}
                  className="px-3 py-1.5 rounded-xl bg-warmBg dark:bg-darkSurface hover:bg-green-50 dark:hover:bg-darkBorder text-forest dark:text-darkTextPrimary font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>{t.viewDetails}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-agri dark:text-limeAccent" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-forest/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-elevated border border-gray-100 dark:border-darkBorder animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-forest dark:text-darkTextPrimary mb-4">
              {editingFarm ? 'Edit Farm Details' : 'Register New Farm Plot'}
            </h3>

            <form onSubmit={handleSaveFarm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  placeholder="e.g. Kisan Kalyan Farm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formState}
                    onChange={e => setFormState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={formDistrict}
                    onChange={e => setFormDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Area</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formArea}
                    onChange={e => setFormArea(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Unit</label>
                  <select
                    value={formAreaUnit}
                    onChange={e => setFormAreaUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  >
                    <option value="Acre">Acre</option>
                    <option value="Hectare">Hectare</option>
                    <option value="Bigha">Bigha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Soil Type</label>
                  <select
                    value={formSoil}
                    onChange={e => setFormSoil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  >
                    <option value="Loam">Loam (दोमट)</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Black Soil (Regur)">Black Soil (Regur)</option>
                    <option value="Alluvial">Alluvial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Irrigation Method</label>
                  <select
                    value={formIrrigation}
                    onChange={e => setFormIrrigation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  >
                    <option value="Tube Well">Tube Well</option>
                    <option value="Drip">Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Canal / Flood">Canal / Flood</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Current Crop</label>
                <select
                  value={formCropId}
                  onChange={e => setFormCropId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                >
                  {CROPS_DATABASE.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameHi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-darkBorder">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-darkBorder font-bold text-gray-600 dark:text-darkTextSecondary hover:bg-gray-50 dark:hover:bg-darkSurface"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest dark:bg-forest-light text-limeAccent font-bold hover:bg-forest-light"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-forest/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard rounded-3xl max-w-sm w-full p-6 shadow-elevated border border-gray-100 dark:border-darkBorder text-center">
            <h4 className="text-base font-bold text-forest dark:text-darkTextPrimary mb-2">Confirm Delete</h4>
            <p className="text-xs text-secondaryText dark:text-darkTextSecondary mb-6">
              Are you sure you want to delete this farm?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-darkBorder text-xs font-bold text-gray-600 dark:text-darkTextSecondary"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-criticalRed text-white text-xs font-bold hover:bg-red-700"
              >
                {t.deleteFarm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
