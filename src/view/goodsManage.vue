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
                     placeholder="搜索条件 : 商品小类">
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
      <el-form-item label="详情" :label-width="formLabelWidth">
        <myEditor ref="wangEditor"/>
      </el-form-item>
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
        :action="getServerUrl('/goods/setCardImage?goodsId='+goodsIdNow)"
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
      title="商品详情轮播图片管理">
    <el-upload
        ref="uploadRef2"
        class="upload-demo"
        :action="getServerUrl('/goods/updateGoodsDetailsSwiperImage?goodsId='+goodsIdNow)"
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
              :src="getServerUrl('')+'/image/goods/swiper/'+scope.row.imageName" style="width: 150px"/>
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
        <el-button type="danger" @click="setSwiperImageDialogFormVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
  <div>
    <div>
      <el-cascader v-model="searchValue.typeId" :options="optionsGoodsType" filterable clearable
                   placeholder="搜索条件 : 商品小类">
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
          style="width: 288px;margin-left: 2px"
          placeholder="搜索条件 : 名称"
      >
        <template #append>
          <el-button :icon="Search" @click="loadData"/>
        </template>
      </el-input>
      <el-button
          type="primary"
          style="margin-left: 3px"
          @click="openGoodsDialog(1)"
      >添加
      </el-button
      >
    </div>
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true">
      <el-table-column prop="name" fixed="left" width="300" label="名称" align="center"/>
      <el-table-column prop="cardImageName" label="展示图片" width="85" align="center">
        <template #default="scope">
          <el-image
              :src="getServerUrl('')+'/image/goods/card/'+scope.row.cardImageName" :fit="fit"/>
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
              openGoodsDialog(2);
              getGoodsDetails(scope.row.id);
            "
          />
          <el-button
              type="success"
              :icon="Edit"
              circle
              @click="
              openGoodsDialog(3);
              getGoodsDetails(scope.row.id);
            "
          />
          <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="你确定要删除这个商品小类吗?"
              @confirm="confirmDelete(scope.row.id)"
          >
            <template #reference>
              <el-button type="danger" :icon="Delete" circle/>
            </template>
          </el-popconfirm>
          <el-tooltip
              class="box-item"
              effect="dark"
              content="设置首页轮播图图片"
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
import {getServerUrl} from "@/util/url";
import axios from "axios";
import myEditor from "@/components/myEditor.vue";

const uploadRef = ref();
const uploadRef2 = ref();

const wangEditor = ref();
const searchValue = ref({
  name: "",
  typeId: null,
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
  pageSize: 9,
  total: 0,
});
const formLabelWidth = "70px";
const cardImageName = ref('default.png');

//加载数据
const loadData = () => {
  let param = new URLSearchParams();
  if (searchValue.value.name !== "") {
    param.append("name", searchValue.value.name);
  }
  if (searchValue.value.typeId !== null) {
    param.append("smallTypeId", searchValue.value.typeId[1]);
  }
  param.append("currentPage", pagination.value.currentPage);
  param.append("pageSize", pagination.value.pageSize);
  let url = getServerUrl("/goods/list");
  axios
      .get(url, {params: param})
      .then(function (response) {
        tableData.value = response.data.goodsList;
        pagination.value.total = response.data.total;
      })
      .catch(function (error) {
        console.log(error);
      });
  let url2 = getServerUrl("/bigType/getAllBigTypeRemoveSmallTypeNumIsZero");
  let options = [];
  axios
      .get(url2)
      .then(function (response) {
        let allBigTypeList = response.data.allBigTypeList;
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
      })
      .catch(function (error) {
      });
};
//打开Dialog设置title
const openGoodsDialog = (type) => {
  if (type === 1) {
    dialogType.value = 1;
    dialogTitle.value = "添加商品";
    goodsDialogVisible.value = true;
  }
  if (type === 2) {
    dialogType.value = 2;
    dialogTitle.value = "查看商品";
    goodsDialogVisible.value = true;
  }
  if (type === 3) {
    dialogType.value = 3;
    dialogTitle.value = "修改商品";
    goodsDialogVisible.value = true;
  }
};
const closeGoodsDialog = () => {
  goodsDialogVisible.value = false;
  resetValue();
};

const resetValue = () => {
  goodsForm.value.id = 0;
  goodsForm.value.name = '';
  goodsForm.value.typeId = null;
  goodsForm.value.price = null;
  goodsForm.value.stock = null;
  goodsForm.value.description = '';
  wangEditor.value.valueHtml = ''
}
const changeHotGoodsStatus = (id) => {
  let param = new URLSearchParams();
  param.append("id", id);
  let url = getServerUrl('/goods/changeHotGoodsStatus');
  axios.post(url, param).then(function (response) {
    ElMessage.success(response.data.msg);
  }).catch(function (error) {

  })
}
const changeSwiperGoodsStatus = (id) => {
  let param = new URLSearchParams();
  param.append("id", id);
  let url = getServerUrl('/goods/changeSwiperGoodsStatus');
  axios.post(url, param).then(function (response) {
    ElMessage.success(response.data.msg);
  }).catch(function (error) {

  })
}

const saveGoods = () => {
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
  if (wangEditor.value.valueHtml === '') {
    ElMessage.error("请输入商品详情");
    return false;
  }
  let param = new URLSearchParams();
  if (goodsForm.value.id !== 0) {
    param.append("id", goodsForm.value.id);
  }
  param.append("name", goodsForm.value.name);
  param.append("smallTypeId", goodsForm.value.typeId[1]);
  param.append("price", goodsForm.value.price);
  param.append("stock", goodsForm.value.stock);
  param.append("description", goodsForm.value.description);
  param.append("details", wangEditor.value.valueHtml);
  let url = getServerUrl('/goods/save');
  axios.post(url, param).then(function (response) {
    goodsDialogVisible.value = false;
    ElMessage.success(response.data.msg);
    loadData();
    resetValue();
  }).catch(function (error) {

  })
}

//删除商品
const confirmDelete = (id) => {
  let param = new URLSearchParams();
  let url = getServerUrl('/goods/delete');
  param.append("id", id);
  axios.post(url, param).then(function (response) {
    if (response.data.code === 0) {
      ElMessage.success(response.data.msg);
      loadData();
    }
    if (response.data.code === 500) {
      ElMessage.error(response.data.msg);
    }
  }).catch(function (error) {
    console.log(error);
  })
}

//根据id获取商品
const getGoodsDetails = (id) => {
  if (id !== 0) {
    goodsForm.value.id = id;
  }
  let url = getServerUrl("/goods/findById?id=" + id);
  axios.get(url).then(function (response) {
    goodsForm.value.name = response.data.goods.name;
    goodsForm.value.typeId = response.data.typeId;
    goodsForm.value.price = response.data.goods.price;
    goodsForm.value.stock = response.data.goods.stock;
    goodsForm.value.description = response.data.goods.description;
    wangEditor.value.valueHtml = response.data.goods.details;
  }).catch(function (error) {

  })
}

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

const submitUpload2 = () => {
  if (uploadRef2.value !== null) {
    uploadRef2.value.submit();
    uploadRef2.value.clearFiles();
    setTimeout(() => {
      loadSwiperImageList();
    }, 500)
  }
}

const openSetCardImageDialog = (id) => {
  setCardImageDialogFormVisible.value = true;
  goodsIdNow.value = id;
}

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

const openSetSwiperImageDialog = (id) => {
  setSwiperImageDialogFormVisible.value = true;
  goodsIdNow.value = id;
  loadSwiperImageList();
}

const loadSwiperImageList = () => {
  let url = getServerUrl('/goods/getGoodsDetailsSwiperImageNameList?goodsId=' + goodsIdNow.value);
  axios.get(url).then(function (response) {
    let goodsDetailsSwiperImageNameList = [];
    goodsDetailsSwiperImageNameList = response.data.imageNameLsit;
    swiperImageList.value = [];
    for (let i = 0; i < goodsDetailsSwiperImageNameList.length; i++) {
      if (goodsDetailsSwiperImageNameList[i] !== '') {
        swiperImageList.value[i] = {
          imageName: goodsDetailsSwiperImageNameList[i]
        }
      }
    }
    console.log(swiperImageList.value);
  }).catch(function (error) {

  })
}

const deleteGoodsDetailsSwiperImage = (imageName) => {
  let param = new URLSearchParams();
  let goodsId = goodsIdNow.value;
  param.append("goodsId", goodsId);
  param.append("imageName", imageName);
  let url = getServerUrl('/goods/deleteGoodsDetailsSwiperImage');
  axios.post(url, param).then(function (response) {
    setTimeout(() => {
      loadSwiperImageList();
    }, 500)
  }).catch(function (error) {

  })
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>

</style>
