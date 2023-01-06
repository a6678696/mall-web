<template>
  <el-dialog fullscreen="true"
             v-model="goodsDialogVisible"
             :title="dialogTitle"
             width="60%"
             :show-close="false"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
  >
    <el-form :model="goodsForm">
      <el-form-item label="名称" :label-width="formLabelWidth">
        <el-input v-model="goodsForm.name"/>
      </el-form-item>
      <el-form-item label="商品小类" :label-width="formLabelWidth">
        <el-cascader v-model="goodsForm.typeId" :options="optionsGoodsType" filterable clearable
                     placeholder="选择商品小类">
          <template #default="{ node, data }">
            <span>{{ data.label }}</span>
            <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item label="价格" :label-width="formLabelWidth">
        <el-input v-model="goodsForm.price"/>
      </el-form-item>
      <el-form-item label="库存" :label-width="formLabelWidth">
        <el-input v-model="goodsForm.stock"/>
      </el-form-item>
      <el-form-item label="描述" :label-width="formLabelWidth">
        <el-input v-model="goodsForm.description"/>
      </el-form-item>
      <p>商品详情</p>
      <QuillEditor
          v-model:content="content"
          placeholder="这里输入商品详情..."
          theme="snow"
          ref="editor"
          toolbar="full"
          contentType="html"
          :modules="modules"
          style="height: 500px;"
      />
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeGoodsDialog">关闭</el-button>
        <el-button
            type="primary"
            @click="saveGoods"
            v-if="dialogType !== 2"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
      v-model="setCardImageDialogFormVisible"
      width="30%"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      title="更换商品卡片图片">
    <el-upload
        ref="uploadRef"
        class="upload-demo"
        :action="axiosUtil.getServerUrl('/goods/setCardImage?goodsId='+goodsIdNow)"
        :limit="1"
        :auto-upload="false"
        :before-upload="beforeimageUpload"
    >
      <template #trigger>
        <el-button type="success">选择图片</el-button>
      </template>

      <template #tip>
        <div class="el-upload__tip">
          图片必须是jpg格式/图片大小不能超过2MB
        </div>
      </template>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setCardImageDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
      fullscreen="true"
      v-model="setSwiperImageDialogFormVisible"
      width="40%"
      :close-on-click-modal="false"
      @close="loadData"
      title="商品详情轮播图片管理">
    <el-upload
        ref="uploadRef2"
        class="upload-demo"
        :action="axiosUtil.getServerUrl('/goods/updateGoodsDetailsSwiperImage?goodsId='+goodsIdNow)"
        :limit="1"
        :auto-upload="false"
        :before-upload="beforeimageUpload"
    >
      <template #trigger>
        <el-button type="success">选择图片</el-button>
      </template>&nbsp;

      <el-button type="primary" @click="submitUpload2">
        上传到服务器
      </el-button>

      <template #tip>
        <div class="el-upload__tip">
          图片必须是jpg格式/图片大小不能超过2MB/一次只能上传一张
        </div>
      </template>
    </el-upload>
    <el-table :data="swiperImageList" v-show="swiperImageList.length>0" border style="width: 100%">
      <el-table-column prop="imageName" label="图片" align="center">
        <template #default="scope">
          <el-image
              :src="axiosUtil.getServerUrl('/image/goods/swiper/'+scope.row.imageName)" style="width: 150px"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="danger" @click="deleteGoodsDetailsSwiperImage(scope.row.imageName)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <h3 style="color: red" v-show="swiperImageList.length===0">当前商品没有详情轮播图图片</h3>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="danger" @click="setSwiperImageDialogFormVisible = false;">关闭</el-button>
      </span>
    </template>
  </el-dialog>
  <div>
    <div>
      <el-select clearable v-model="searchValue.optionsHotGoodsValue" placeholder="是否热卖" style="width: 100px;">
        <el-option
            v-for="item in optionsHotGoods"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-select clearable v-model="searchValue.optionsRecommendGoodsValue" placeholder="是否推荐"
                 style="width: 100px;margin-left: 2px">
        <el-option
            v-for="item in optionsRecommendGoods"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-select clearable v-model="searchValue.optionsSwiperGoodsValue" placeholder="是否首页轮播图商品"
                 style="width: 180px;margin-left: 2px">
        <el-option
            v-for="item in optionsSwiperGoods"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-cascader v-model="searchValue.typeId" :options="optionsGoodsType" filterable clearable
                   placeholder="商品小类" style="width: 180px;margin-left: 2px">
        <template #default="{ node, data }">
          <span>{{ data.label }}</span>
          <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
        </template>
      </el-cascader>
      <el-input
          v-model="searchValue.name"
          v-on:keyup.enter="loadData"
          class="input-with-select"
          clearable
          style="width: 180px;margin-left: 2px"
          placeholder="商品名称"/>
      <el-button @click="loadData" style="margin-left: 2px">搜索</el-button>
      <el-button
          type="primary"
          style="float: right"
          @click="openGoodsDialog(1)"
      >添加
      </el-button>
    </div>
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true" max-height="480">
      <el-table-column prop="name" fixed="left" width="300" label="名称" align="center"/>
      <el-table-column prop="cardImageName" label="展示图片" width="85" align="center">
        <template #default="scope">
          <el-image
              :src="axiosUtil.getServerUrl('/image/goods/card/'+scope.row.cardImageName)" :fit="fit"/>
        </template>
      </el-table-column>
      <el-table-column prop="typeName" label="分类" width="250" align="center"/>
      <el-table-column prop="isHotGoods" label="是否热卖" width="110" align="center">
        <template #default="scope">
          <el-switch
              v-model="scope.row.hotGoods"
              inline-prompt
              active-text="是"
              inactive-text="否"
              @change="changeHotGoodsStatus(scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column label="是否推荐" width="110" align="center">
        <template #default="scope">
          <el-switch
              v-model="scope.row.recommendGoods"
              inline-prompt
              active-text="是"
              inactive-text="否"
              @change="changeRecommendGoodsStatus(scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column label="是否首页轮播" width="110" align="center">
        <template #default="scope">
          <el-switch
              v-model="scope.row.swiperGoods"
              inline-prompt
              active-text="是"
              inactive-text="否"
              @change="changeSwiperGoodsStatus(scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="70" align="center"/>
      <el-table-column prop="salesVolume" label="销量" width="70" align="center"/>
      <el-table-column fixed="right" label="操作" width="250" align="center">
        <template #default="scope">
          <el-button
              :icon="Search"
              circle
              @click="
              openGoodsDialog(2,scope.row.id);
            "
          />
          <el-button
              type="success"
              :icon="Edit"
              circle
              @click="
              openGoodsDialog(3,scope.row.id);
            "
          />
          <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="你确定要删除这个商品吗?"
              @confirm="confirmDelete(scope.row.id)"
          >
            <template #reference>
              <el-button type="danger" :icon="Delete" circle/>
            </template>
          </el-popconfirm>
          <el-tooltip
              class="box-item"
              effect="dark"
              content="设置商品卡片图片"
              placement="top"
          >
            <el-button
                type="primary"
                :icon="Picture"
                circle
                @click="openSetCardImageDialog(scope.row.id)"
            />
          </el-tooltip>
          <el-tooltip
              class="box-item"
              effect="dark"
              content="设置详情页轮播图图片"
              placement="top"
          >
            <el-button
                type="warning"
                :icon="PictureRounded"
                circle
                @click="openSetSwiperImageDialog(scope.row.id)"
            />
          </el-tooltip>

        </template>
      </el-table-column>
    </el-table>
    <div class="demo-pagination-block" style="margin-top: 5px">
      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :small="small"
          :disabled="disabled"
          layout="total,prev, pager, next, jumper"
          :total="pagination.total"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {Search, Edit, Delete, Picture, PictureRounded, Download, Plus, ZoomIn} from "@element-plus/icons-vue";
import axiosUtil from '@/util/axios';
import {QuillEditor} from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import ImageUploader from 'quill-image-uploader';
import BlotFormatter from 'quill-blot-formatter';

const uploadRef = ref();
const uploadRef2 = ref();

const content = ref('');
const editor = ref(null);
const modules = [{
  name: 'imageUploader',
  module: ImageUploader,
  options: {
    upload: file => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);
        let url = axiosUtil.getServerUrl() + '/goods/vueQuillUploadImage';
        axios.post(url, formData)
            .then(res => {
              console.log(res)
              resolve(res.data.url);
            })
            .catch(err => {
              reject("Upload failed");
              console.error("Error:", err)
            })
      });
    }
  }
}, {
  name: 'BlotFormatter',
  module: BlotFormatter,
  options: {
    overlay: {
      style: {
        border: '2px solid red',
      }
    }
  }
}]
const searchValue = ref({
  name: "",
  typeId: null,
  optionsHotGoodsValue: null,
  optionsRecommendGoodsValue: null,
  optionsSwiperGoodsValue: null
});
const optionsGoodsType = ref([]);
const allBigTypeList = ref();
const tableData = ref([]);
const swiperImageList = ref([]);
const goodsDialogVisible = ref(false);
const setCardImageDialogFormVisible = ref(false);
const setSwiperImageDialogFormVisible = ref(false);
const dialogTitle = ref("");
const dialogType = ref(0);
const goodsIdNow = ref(-1);
const goodsForm = ref({
  id: 0,
  name: "",
  typeId: null,
  price: null,
  stock: null,
  description: ''
});
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const formLabelWidth = "70px";
const optionsHotGoods = [
  {
    value: true,
    label: '是',
  },
  {
    value: false,
    label: '否',
  }
]
const optionsSwiperGoods = [
  {
    value: true,
    label: '是',
  },
  {
    value: false,
    label: '否',
  }
]
const optionsRecommendGoods = [
  {
    value: true,
    label: '是',
  },
  {
    value: false,
    label: '否',
  }
]

//加载数据
const loadData = async () => {
  let params = new URLSearchParams();
  if (searchValue.value.name !== "") {
    params.append("name", searchValue.value.name);
  }
  if (searchValue.value.typeId !== null) {
    params.append("smallTypeId", searchValue.value.typeId[1]);
  }
  if (searchValue.value.optionsHotGoodsValue !== null) {
    params.append("hotGoods", searchValue.value.optionsHotGoodsValue);
  }
  if (searchValue.value.optionsRecommendGoodsValue !== null) {
    params.append("recommendGoods", searchValue.value.optionsRecommendGoodsValue);
  }
  if (searchValue.value.optionsSwiperGoodsValue !== null) {
    params.append("swiperGoods", searchValue.value.optionsSwiperGoodsValue);
  }
  params.append("currentPage", pagination.value.currentPage);
  params.append("pageSize", pagination.value.pageSize);
  //给后端传一个值,给结果排序
  params.append("sortByIdDesc", 1);
  let url = "/goods/list";
  const res = await axiosUtil.get(url, params);
  tableData.value = res.data.goodsList;
  pagination.value.total = res.data.total;
  let url2 = '/bigType/getAllBigTypeRemoveSmallTypeNumIsZero';
  let options = [];
  const res2 = await axiosUtil.get(url2);
  let allBigTypeList = res2.data.allBigTypeList;
  for (let i = 0; i < allBigTypeList.length; i++) {
    options[i] = {
      value: allBigTypeList[i].id,
      label: allBigTypeList[i].name,
      children: []
    }
    for (let j = 0; j < allBigTypeList[i].smallTypeList.length; j++) {
      options[i].children[j] = {
        value: allBigTypeList[i].smallTypeList[j].id,
        label: allBigTypeList[i].smallTypeList[j].name
      }
    }
  }
  optionsGoodsType.value = options;
}
//打开Dialog设置title
const openGoodsDialog = (type, id) => {
  if (type === 1) {
    dialogType.value = 1;
    dialogTitle.value = "添加商品";
    goodsDialogVisible.value = true;
  }
  if (type === 2) {
    dialogType.value = 2;
    dialogTitle.value = "查看商品";
    goodsDialogVisible.value = true;
    getGoodsDetails(id);
  }
  if (type === 3) {
    dialogType.value = 3;
    dialogTitle.value = "修改商品";
    goodsDialogVisible.value = true;
    getGoodsDetails(id);
  }
}

//关闭Dialog
const closeGoodsDialog = () => {
  goodsDialogVisible.value = false;
  resetValue();
}

//重置值
const resetValue = () => {
  goodsForm.value.id = 0;
  goodsForm.value.name = '';
  goodsForm.value.typeId = null;
  goodsForm.value.price = null;
  goodsForm.value.stock = null;
  goodsForm.value.description = '';
  editor.value.setHTML("");
}

//设置商品热卖与否
const changeHotGoodsStatus = async (id) => {
  let params = new URLSearchParams();
  params.append("id", id);
  let url = '/goods/changeHotGoodsStatus';
  const res = await axiosUtil.post(url, params);
  ElMessage.success(res.data.msg);
}

//设置轮播图商品与否
const changeSwiperGoodsStatus = async (id) => {
  let params = new URLSearchParams();
  params.append("id", id);
  let url = '/goods/changeSwiperGoodsStatus';
  const res = await axiosUtil.post(url, params);
  ElMessage.success(res.data.msg);
}

//设置商品推荐与否
const changeRecommendGoodsStatus = async (id) => {
  let params = new URLSearchParams();
  params.append("id", id);
  let url = '/goods/changeRecommendGoodsStatus';
  const res = await axiosUtil.post(url, params);
  ElMessage.success(res.data.msg);
}

//保存商品信息
const saveGoods = async () => {
  if (goodsForm.value.name === '') {
    ElMessage.error("请输入名称");
    return false;
  }
  if (goodsForm.value.typeId === null) {
    ElMessage.error("请选择商品小类");
    return false;
  }
  if (goodsForm.value.price === null) {
    ElMessage.error("请输入价格");
    return false;
  }
  if (goodsForm.value.stock === null) {
    ElMessage.error("请输入库存");
    return false;
  }
  if (goodsForm.value.description === '') {
    ElMessage.error("请输入描述");
    return false;
  }
  //VueQuill富文本编辑器的内容为空时也有HTML: <p><br></p>
  if (editor.value.getHTML() === '<p><br></p>') {
    ElMessage.error("请输入商品详情");
    return false;
  }
  let params = new URLSearchParams();
  if (goodsForm.value.id !== 0) {
    params.append("id", goodsForm.value.id);
  }
  params.append("name", goodsForm.value.name);
  params.append("smallTypeId", goodsForm.value.typeId[1]);
  params.append("price", goodsForm.value.price);
  params.append("stock", goodsForm.value.stock);
  params.append("description", goodsForm.value.description);
  params.append("details", editor.value.getHTML());
  let url = '/goods/save';
  const res = await axiosUtil.post(url, params);
  goodsDialogVisible.value = false;
  ElMessage.success(res.data.msg);
  resetValue();
  await loadData();
}

//删除商品
const confirmDelete = async (id) => {
  let params = new URLSearchParams();
  let url = '/goods/delete';
  params.append("id", id);
  const res = await axiosUtil.post(url, params);
  if (res.data.code === 0) {
    ElMessage.success(res.data.msg);
    await loadData();
  }
  if (res.data.code === 500) {
    ElMessage.error(res.data.msg);
  }
}

//根据id获取商品
const getGoodsDetails = async (id) => {
  goodsForm.value.id = id;
  let url = '/goods/findById';
  let params = new URLSearchParams();
  params.append("id", id);
  const res = await axiosUtil.get(url, params);
  goodsForm.value.name = res.data.goods.name;
  goodsForm.value.typeId = res.data.typeId;
  goodsForm.value.price = res.data.goods.price;
  goodsForm.value.stock = res.data.goods.stock;
  goodsForm.value.description = res.data.goods.description;
  editor.value.setHTML(res.data.goods.details);
}

//上传卡片图片
const submitUpload = () => {
  if (uploadRef.value !== null) {
    uploadRef.value.submit();
    uploadRef.value.clearFiles();
  }
  setCardImageDialogFormVisible.value = false;
  setTimeout(() => {
    loadData();
  }, 500)
}

//上传商品详情轮播图图片
const submitUpload2 = () => {
  if (uploadRef2.value !== null) {
    uploadRef2.value.submit();
    uploadRef2.value.clearFiles();
    setTimeout(() => {
      loadSwiperImageList();
    }, 500)
  }
}

//打开设置卡片图片的Dialog
const openSetCardImageDialog = (id) => {
  setCardImageDialogFormVisible.value = true;
  goodsIdNow.value = id;
}

//把图片上传到服务器前验证
const beforeimageUpload = (file) => {
  if (swiperImageList.value.length >= 8) {
    ElMessage.error('最多上传8张图片,可以删除后再上传');
    return false;
  }
  const isJPG = file.type === 'image/jpeg';
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('图片必须是jpg格式')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2M!')
  }
  return isJPG && isLt2M
}

//打开设置商品详情轮播图图片的Dialog
const openSetSwiperImageDialog = (id) => {
  swiperImageList.value = [];
  setSwiperImageDialogFormVisible.value = true;
  goodsIdNow.value = id;
  loadSwiperImageList();
}

//加载商品详情轮播图图片
const loadSwiperImageList = async () => {
  let params = new URLSearchParams();
  params.append("goodsId", goodsIdNow.value);
  let url = '/goods/getGoodsDetailsSwiperImageNameList';
  const res = await axiosUtil.get(url, params);
  let goodsDetailsSwiperImageNameList = res.data.imageNameLsit;
  swiperImageList.value = [];
  for (let i = 0; i < goodsDetailsSwiperImageNameList.length; i++) {
    if (goodsDetailsSwiperImageNameList[i] !== '') {
      swiperImageList.value[i] = {
        imageName: goodsDetailsSwiperImageNameList[i]
      }
    }
  }
}

//删除商品详情轮播图图片
const deleteGoodsDetailsSwiperImage = (imageName) => {
  let params = new URLSearchParams();
  params.append("goodsId", goodsIdNow.value);
  params.append("imageName", imageName);
  let url = '/goods/deleteGoodsDetailsSwiperImage';
  axiosUtil.post(url, params);
  setTimeout(() => {
    loadSwiperImageList();
  }, 500)
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>

</style>
